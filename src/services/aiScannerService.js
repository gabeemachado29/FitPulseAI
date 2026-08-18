/**
 * FitPulseAI — AI Scanner Service (Production-Grade)
 *
 * Uses Google Gemini 2.5 Flash for food recognition and nutritional estimation.
 * Features:
 * - Professional nutritionist prompts (PT-BR)
 * - Image compression before sending
 * - Retry with exponential backoff
 * - Structured JSON schema validation
 * - Confidence scoring
 * - Detailed per-item breakdown
 */

import { compressImage, stripBase64Prefix } from './imageUtils';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Retry delays in ms
const RETRY_DELAYS = [1500, 3500];

// ── Structured response schema for Gemini ──
const NUTRITION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Nome curto e descritivo da refeição (máx 50 chars)' },
    calories: { type: 'integer', description: 'Total de calorias (kcal)' },
    protein: { type: 'number', description: 'Total de proteína em gramas' },
    carbs: { type: 'number', description: 'Total de carboidratos em gramas' },
    fat: { type: 'number', description: 'Total de gordura em gramas' },
    fiber: { type: 'number', description: 'Total de fibras em gramas' },
    confidence: {
      type: 'string',
      description: 'Nível de confiança da estimativa',
      enum: ['alta', 'media', 'baixa'],
    },
    items: {
      type: 'array',
      description: 'Lista de cada alimento identificado separadamente',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nome do alimento' },
          portion: { type: 'string', description: 'Porção estimada (ex: 150g, 1 concha, 1 unidade)' },
          calories: { type: 'integer', description: 'Calorias do item' },
          protein: { type: 'number', description: 'Proteína do item em gramas' },
          carbs: { type: 'number', description: 'Carboidratos do item em gramas' },
          fat: { type: 'number', description: 'Gordura do item em gramas' },
        },
        required: ['name', 'portion', 'calories'],
      },
    },
    explanation: { type: 'string', description: 'Justificativa nutricional breve em 1-2 frases' },
  },
  required: ['name', 'calories', 'protein', 'carbs', 'fat', 'confidence', 'items', 'explanation'],
};

// ── Professional System Prompts ──

const SYSTEM_PROMPT_TEXT = `Você é um nutricionista esportivo brasileiro certificado (CRN), com mais de 15 anos de experiência em avaliação nutricional.

TAREFA: Analise a descrição de refeição fornecida pelo usuário e estime as informações nutricionais com a maior precisão possível.

REGRAS OBRIGATÓRIAS:
1. Identifique CADA alimento mencionado separadamente no campo "items"
2. Estime a porção usando padrões brasileiros típicos:
   - "1 prato de arroz" = ~150-200g cozido
   - "1 concha de feijão" = ~80-100g
   - "1 filé de frango" = ~120-150g
   - "1 fatia de pão" = ~25-30g
3. Use como referência a Tabela TACO (Tabela Brasileira de Composição de Alimentos) e USDA
4. Considere o método de preparo quando mencionado (frito adiciona gordura, grelhado não)
5. Se o usuário informar gramas/porções específicas, use esses valores
6. Se algo for ambíguo, use a porção mais comum no Brasil
7. O campo "confidence" deve refletir a precisão: "alta" se porções foram informadas, "media" para descrições genéricas, "baixa" para itens vagos
8. Some os totais de todos os itens para os campos principais (calories, protein, carbs, fat)
9. O campo "explanation" deve ser 1-2 frases justificando a estimativa
10. Inclua fibras no campo "fiber" quando relevante`;

const SYSTEM_PROMPT_PHOTO = `Você é um nutricionista esportivo brasileiro certificado (CRN) com visão computacional especializada em identificação de alimentos.

TAREFA: Analise esta foto de refeição e identifique cada alimento visível, estimando as informações nutricionais.

REGRAS OBRIGATÓRIAS:
1. Examine a foto com atenção e identifique CADA alimento visível
2. Liste cada alimento separadamente no campo "items" com porção estimada
3. Estime porções pelo tamanho visual relativo ao prato/recipiente:
   - Prato fundo padrão brasileiro = ~22-24cm de diâmetro
   - Copo americano = ~200ml
   - Colher de sopa cheia = ~15g de sólido
4. Considere o método de preparo aparente:
   - Brilho = presença de óleo/gordura (frito/refogado)
   - Sem brilho = grelhado/cozido/assado
   - Cor dourada = empanado/frito
5. Use a Tabela TACO e USDA como referência para cálculos
6. Se não conseguir identificar um alimento com certeza, inclua-o com confidence "baixa"
7. Se a foto estiver desfocada, escura ou não mostrar alimentos, retorne confidence "baixa" e explique no campo "explanation"
8. Some os totais de todos os itens para os campos principais
9. O campo "name" deve descrever o prato de forma concisa (ex: "Arroz, feijão e frango grelhado")
10. Inclua fibras no campo "fiber" quando relevante`;

// ── Main API Functions ──

/**
 * Analyze a text description of a meal using Gemini 2.5 Flash.
 * @param {string} description - User's meal description in Portuguese
 * @returns {Promise<object>} - Nutritional analysis result
 */
export async function analyzeTextMeal(description) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim() || apiKey.includes('your_gemini')) {
    throw new Error('API_KEY_MISSING');
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT_TEXT }],
    },
    contents: [
      {
        parts: [
          {
            text: `Analise esta refeição:\n"${description}"`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: NUTRITION_RESPONSE_SCHEMA,
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };

  const result = await callGeminiWithRetry(apiKey, requestBody);
  return normalizeResult(result, 'texto');
}

/**
 * Analyze a photo of a meal using Gemini 2.5 Flash vision capabilities.
 * @param {string} base64Data - Base64 image data (data URI or raw)
 * @param {string} mimeType - MIME type of the image
 * @returns {Promise<object>} - Nutritional analysis result
 */
export async function analyzePhotoMeal(base64Data, mimeType = 'image/jpeg') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim() || apiKey.includes('your_gemini')) {
    throw new Error('API_KEY_MISSING');
  }

  // Compress image to reduce payload size and avoid timeouts
  let compressedBase64;
  let compressionInfo;

  try {
    compressionInfo = await compressImage(base64Data, 1024, 0.85);
    compressedBase64 = compressionInfo.base64;
    mimeType = compressionInfo.mimeType;
    console.log(
      `📸 Imagem comprimida: ${compressionInfo.originalSizeKB}KB → ${compressionInfo.compressedSizeKB}KB (${compressionInfo.width}×${compressionInfo.height})`
    );
  } catch (compErr) {
    console.warn('Compressão falhou, usando imagem original:', compErr);
    compressedBase64 = stripBase64Prefix(base64Data);
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT_PHOTO }],
    },
    contents: [
      {
        parts: [
          {
            text: 'Identifique todos os alimentos nesta foto e calcule os valores nutricionais detalhados.',
          },
          {
            inlineData: {
              mimeType,
              data: compressedBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: NUTRITION_RESPONSE_SCHEMA,
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };

  const result = await callGeminiWithRetry(apiKey, requestBody);
  return normalizeResult(result, 'foto');
}

// ── Internal Helpers ──

/**
 * Call Gemini API with retry + exponential backoff.
 */
async function callGeminiWithRetry(apiKey, requestBody) {
  let lastError = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorBody);

        // Don't retry on auth or quota errors
        if (response.status === 401 || response.status === 403) {
          throw new Error('API_KEY_INVALID');
        }
        if (response.status === 429) {
          throw new Error('RATE_LIMITED');
        }

        throw new Error(`API_ERROR_${response.status}`);
      }

      const data = await response.json();

      // Extract and validate response
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!jsonText) {
        // Check for safety blocks
        const finishReason = data.candidates?.[0]?.finishReason;
        if (finishReason === 'SAFETY') {
          throw new Error('CONTENT_BLOCKED');
        }
        throw new Error('EMPTY_RESPONSE');
      }

      return JSON.parse(jsonText);
    } catch (err) {
      lastError = err;

      // Don't retry certain errors
      const noRetryErrors = ['API_KEY_MISSING', 'API_KEY_INVALID', 'RATE_LIMITED', 'CONTENT_BLOCKED'];
      if (noRetryErrors.includes(err.message)) {
        throw err;
      }

      // Wait before retrying
      if (attempt < RETRY_DELAYS.length) {
        console.warn(`Gemini tentativa ${attempt + 1} falhou, retentando em ${RETRY_DELAYS[attempt]}ms...`, err.message);
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      }
    }
  }

  // All retries exhausted
  console.error('Gemini API: todas as tentativas falharam:', lastError);
  throw new Error('AI_UNAVAILABLE');
}

/**
 * Normalize and validate the AI response.
 */
function normalizeResult(parsed, source) {
  return {
    name: (parsed.name || 'Refeição Analisada').substring(0, 80),
    calories: Math.max(0, Math.round(Number(parsed.calories) || 0)),
    protein: Math.max(0, Math.round(Number(parsed.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(parsed.carbs) || 0)),
    fat: Math.max(0, Math.round(Number(parsed.fat) || 0)),
    fiber: Math.max(0, Math.round(Number(parsed.fiber) || 0)),
    confidence: ['alta', 'media', 'baixa'].includes(parsed.confidence) ? parsed.confidence : 'media',
    items: Array.isArray(parsed.items)
      ? parsed.items.map((item) => ({
          name: item.name || 'Item',
          portion: item.portion || '-',
          calories: Math.round(Number(item.calories) || 0),
          protein: Math.round(Number(item.protein) || 0),
          carbs: Math.round(Number(item.carbs) || 0),
          fat: Math.round(Number(item.fat) || 0),
        }))
      : [],
    explanation: parsed.explanation || 'Estimativa calculada via Gemini IA',
    source: source === 'foto' ? 'ai_photo' : 'ai_text',
  };
}

/**
 * Get a user-friendly error message in PT-BR.
 */
export function getAIErrorMessage(errorCode) {
  const messages = {
    API_KEY_MISSING:
      'Chave da API Gemini não configurada. Vá em Configurações e adicione sua VITE_GEMINI_API_KEY.',
    API_KEY_INVALID:
      'Chave da API Gemini inválida ou expirada. Verifique sua chave em aistudio.google.com.',
    RATE_LIMITED:
      'Limite de requisições atingido. Aguarde alguns segundos e tente novamente.',
    CONTENT_BLOCKED:
      'A imagem foi bloqueada pelo filtro de segurança. Tente com outra foto.',
    EMPTY_RESPONSE:
      'A IA não conseguiu analisar. Tente descrever a refeição com mais detalhes ou use outra foto.',
    AI_UNAVAILABLE:
      'O serviço de IA está temporariamente indisponível. Tente novamente em alguns segundos.',
  };

  return messages[errorCode] || 'Erro inesperado na análise. Tente novamente.';
}
