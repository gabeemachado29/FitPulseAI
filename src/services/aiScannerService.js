/**
 * FitPulseAI — High-Precision Multimodal AI Food Analysis Engine
 *
 * Direct integration with Google Gemini 1.5 Flash Vision & Text.
 * Analyzes meals via photo, typed description, or hybrid (photo + text instructions).
 * Compliant with TACO and USDA nutritional tables and Atwater mathematical integrity.
 */

import { compressImage, stripBase64Prefix, getImageMimeType } from './imageUtils';
import { cleanAndParseJson, parseFoodAnalysisResult } from './foodAnalysisModels';

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Retorna uma chave de API válida para o Google Gemini.
 */
function getApiKey() {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;

  if (geminiKey && typeof geminiKey === 'string' && geminiKey.trim().startsWith('AIzaSy')) {
    return geminiKey.trim();
  }
  if (firebaseKey && typeof firebaseKey === 'string' && firebaseKey.trim().startsWith('AIzaSy')) {
    return firebaseKey.trim();
  }
  return 'AIzaSyCp4Hdx13bFDJ1TE3qrCzZ5G6KtgUWu1Qc';
}

/**
 * System Prompt oficial interno para o motor de visão e inteligência nutricional.
 */
export const SYSTEM_PROMPT_FOOD_ANALYSIS = `Você é o motor especialista em inteligência nutricional e visão computacional do FitPulseAI.
Sua missão é analisar entradas alimentares (imagem, texto descritivo ou ambos combinados) e retornar a decomposição nutricional exata baseada nas tabelas TACO e USDA.

DIRETRIZES DE PROCESSAMENTO:
1. Modalidades de Entrada:
   - Apenas Imagem: Estime os itens, volumes geométricos (cm³), densidade e converta para gramas.
   - Apenas Texto: Converta medidas caseiras (colheres, conchas, xícaras, fatias) para gramas e calcule os nutrientes.
   - Imagem + Texto: O texto do usuário tem prioridade para ingredientes ocultos (ex: "feito com 1 colher de manteiga", "frango frito", "leite desnatado").
2. Decomposição de Preparações: Separe pratos compostos em itens base (ex: estrogonofe -> proteína + molho/creme + acompanhamentos).
3. Regra Matemática Obrigatória:
   - Proteína = 4 kcal/g | Carboidrato = 4 kcal/g | Gordura = 9 kcal/g
   - calorias_totais = (proteina * 4) + (carboidrato * 4) + (gordura * 9)
4. Modos de Falha:
   - Se a foto ou texto não contiver nenhum item alimentício, defina "is_food": false e preencha "notes" com o motivo.

FORMATO DE RESPOSTA (ESTRITAMENTE JSON PURO, SEM MARKDOWN, SEM BLOCOS json):
{
  "is_food": true,
  "confidence": "high",
  "input_mode": "image | text | hybrid",
  "meal_summary": "Nome descritivo da refeição",
  "total_nutrition": {
    "calories_kcal": 0,
    "protein_g": 0.0,
    "carbohydrates_g": 0.0,
    "fats_g": 0.0,
    "fiber_g": 0.0
  },
  "items": [
    {
      "name": "Nome do alimento ou ingrediente",
      "serving_description": "Ex: 1 concha média / 150g",
      "estimated_weight_g": 0,
      "calories_kcal": 0,
      "protein_g": 0.0,
      "carbohydrates_g": 0.0,
      "fats_g": 0.0,
      "fiber_g": 0.0
    }
  ],
  "health_insights": [
    "Dica prática ou observação nutricional relevante."
  ],
  "notes": "Observações sobre preparo ou inferências."
}`;

/**
 * Esquema estruturado JSON para forçar resposta tipada no Gemini.
 */
export const FOOD_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    is_food: { type: 'boolean', description: 'true se houver alimento reconhecível, false caso contrário' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    input_mode: { type: 'string', enum: ['image', 'text', 'hybrid'] },
    meal_summary: { type: 'string', description: 'Nome descritivo do prato ou motivo se não for alimento' },
    total_nutrition: {
      type: 'object',
      properties: {
        calories_kcal: { type: 'number', description: 'Calorias totais = (P*4) + (C*4) + (G*9)' },
        protein_g: { type: 'number', description: 'Proteína total em gramas' },
        carbohydrates_g: { type: 'number', description: 'Carboidratos totais em gramas' },
        fats_g: { type: 'number', description: 'Gordura total em gramas' },
        fiber_g: { type: 'number', description: 'Fibras totais em gramas' },
      },
      required: ['calories_kcal', 'protein_g', 'carbohydrates_g', 'fats_g', 'fiber_g'],
    },
    items: {
      type: 'array',
      description: 'Lista de ingredientes e itens individuais identificados',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nome do alimento ou ingrediente' },
          serving_description: { type: 'string', description: 'Descrição da porção e medidas' },
          estimated_weight_g: { type: 'number', description: 'Peso estimado em gramas' },
          calories_kcal: { type: 'number', description: 'Calorias do item = (P*4) + (C*4) + (G*9)' },
          protein_g: { type: 'number', description: 'Proteína em gramas' },
          carbohydrates_g: { type: 'number', description: 'Carboidratos em gramas' },
          fats_g: { type: 'number', description: 'Gordura em gramas' },
          fiber_g: { type: 'number', description: 'Fibras em gramas' },
        },
        required: ['name', 'serving_description', 'estimated_weight_g', 'calories_kcal', 'protein_g', 'carbohydrates_g', 'fats_g', 'fiber_g'],
      },
    },
    health_insights: {
      type: 'array',
      items: { type: 'string' },
      description: 'Dicas práticas ou observações nutricionais',
    },
    notes: { type: 'string', description: 'Observações de preparo ou inferências' },
  },
  required: ['is_food', 'confidence', 'input_mode', 'meal_summary', 'total_nutrition', 'items', 'health_insights', 'notes'],
};

/**
 * Método principal de análise multimodal de refeições.
 * @param {object} params
 * @param {File|Blob|null} [params.imageFile]
 * @param {string|null} [params.imageBase64]
 * @param {string|null} [params.textDescription]
 * @returns {Promise<import('./foodAnalysisModels').FoodAnalysisResult>}
 */
export async function analyzeMeal({ imageFile = null, imageBase64 = null, textDescription = '' } = {}) {
  const hasImage = Boolean(imageFile || (imageBase64 && typeof imageBase64 === 'string' && imageBase64.trim().length > 0));
  const hasText = Boolean(textDescription && typeof textDescription === 'string' && textDescription.trim().length > 0);

  // 1. Validação de Entrada: Exigir pelo menos um dos dois parâmetros
  if (!hasImage && !hasText) {
    throw new Error('VALIDATION_ERROR: Forneça uma foto ou descreva a sua refeição.');
  }

  const apiKey = getApiKey();
  let inputMode = 'text';
  if (hasImage && hasText) {
    inputMode = 'hybrid';
  } else if (hasImage) {
    inputMode = 'image';
  }

  try {
    const parts = [];

    // 2. Pré-processamento e compressão de imagem se presente
    if (hasImage) {
      const rawSource = imageFile || imageBase64;
      const compressed = await compressImage(rawSource, 1024, 0.85);

      if (hasText) {
        parts.push({
          text: `[INSTRUÇÃO HÍBRIDA FOTO + TEXTO]\nObserve a imagem da refeição e utilize OBRIGATORIAMENTE os seguintes detalhes adicionais fornecidos pelo usuário para ajustar ingredientes ocultos, modo de preparo e porções:\n"${textDescription.trim()}"\n\nIdentifique todos os itens com exatidão segundo TACO/USDA e aplique a equação de Atwater.`,
        });
      } else {
        parts.push({
          text: 'Identifique minuciosamente com máxima precisão todos os alimentos presentes nesta foto, estimando pesos (g) e macronutrientes segundo as tabelas TACO e USDA.',
        });
      }

      parts.push({
        inlineData: {
          mimeType: compressed.mimeType || 'image/jpeg',
          data: compressed.base64,
        },
      });
    } else {
      // Apenas texto
      parts.push({
        text: `[INSTRUÇÃO DE TEXTO]\nDecomponha e analise detalhadamente todos os ingredientes, medidas caseiras e nutrientes desta refeição descrita pelo usuário:\n"${textDescription.trim()}"\n\nConverta medidas para gramas, estime nutrientes pelas tabelas TACO/USDA e aplique a equação de Atwater.`,
      });
    }

    // 3. Executar chamada à API do Gemini com temperature=0.1 e structured schema
    const rawResult = await callGeminiAPI(apiKey, {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT_FOOD_ANALYSIS }],
      },
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: FOOD_ANALYSIS_SCHEMA,
        temperature: 0.1, // Evita alucinações matemáticas
        maxOutputTokens: 2500,
      },
    });

    const parsedResult = parseFoodAnalysisResult(rawResult, inputMode);
    return parsedResult;
  } catch (err) {
    console.error('❌ Erro no motor de IA FitPulseAI:', err);

    // Se for erro de validação direta, repasse
    if (err.message?.startsWith('VALIDATION_ERROR')) {
      throw err;
    }

    // Se a IA responder algo que não seja comida ou erro da API, repassar mensagem tratada
    throw err;
  }
}

/**
 * Chamada HTTP direta à API REST do Google Gemini com sanitização.
 */
async function callGeminiAPI(apiKey, requestBody) {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    if (response.status === 400 && errorText.includes('API_KEY_INVALID')) {
      throw new Error('API_KEY_INVALID');
    }
    throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (data.promptFeedback?.blockReason) {
    throw new Error('CONTENT_BLOCKED');
  }

  const candidate = data.candidates?.[0];
  const jsonText = candidate?.content?.parts?.[0]?.text;

  if (!jsonText) {
    throw new Error('EMPTY_RESPONSE');
  }

  // Sanitização de resposta à prova de falhas
  return cleanAndParseJson(jsonText);
}

/**
 * Helper retrocompatível para fotos
 */
export async function analyzePhotoMeal(base64Data, mimeType = 'image/jpeg') {
  const result = await analyzeMeal({ imageBase64: base64Data });
  // Map back to format expected by older consumers if any
  return {
    ...result,
    name: result.meal_summary,
    calories: result.total_nutrition.calories_kcal,
    protein: result.total_nutrition.protein_g,
    carbs: result.total_nutrition.carbohydrates_g,
    fat: result.total_nutrition.fats_g,
    fiber: result.total_nutrition.fiber_g,
    explanation: result.notes || result.health_insights?.[0] || 'Análise nutricional calculada com precisão.',
    source: 'ai_photo',
  };
}

/**
 * Helper retrocompatível para texto
 */
export async function analyzeTextMeal(description) {
  const result = await analyzeMeal({ textDescription: description });
  return {
    ...result,
    name: result.meal_summary,
    calories: result.total_nutrition.calories_kcal,
    protein: result.total_nutrition.protein_g,
    carbs: result.total_nutrition.carbohydrates_g,
    fat: result.total_nutrition.fats_g,
    fiber: result.total_nutrition.fiber_g,
    explanation: result.notes || result.health_insights?.[0] || 'Análise nutricional calculada com precisão.',
    source: 'ai_text',
  };
}

/**
 * Mensagens amigáveis para erros comuns da IA.
 */
export function getAIErrorMessage(errorCode) {
  if (!errorCode) return 'Erro inesperado na análise. Tente novamente.';

  const str = String(errorCode);
  if (str.includes('VALIDATION_ERROR')) {
    return str.replace('VALIDATION_ERROR: ', '');
  }
  if (str.includes('RATE_LIMITED') || str.includes('429')) {
    return 'Limite de requisições temporário atingido. Aguarde alguns instantes e tente novamente.';
  }
  if (str.includes('CONTENT_BLOCKED')) {
    return 'A imagem ou texto foi bloqueado pelas diretrizes de segurança.';
  }
  if (str.includes('API_KEY_INVALID') || str.includes('API_KEY_MISSING')) {
    return 'Chave de API do Gemini não configurada ou inválida.';
  }
  if (str.includes('EMPTY_RESPONSE') || str.includes('INVALID_JSON_RESPONSE')) {
    return 'A IA não conseguiu interpretar os dados da refeição. Tente fornecer mais detalhes ou uma foto mais nítida.';
  }

  return 'Ocorreu um erro ao comunicar com a inteligência artificial. Verifique sua conexão e tente novamente.';
}
