/**
 * FitPulseAI — PulseBot AI Nutrition & Training Assistant Chat Service
 * Dual-Engine Architecture: Gemini Cloud AI + Local Conversational AI Fallback.
 * 
 * GUARANTEE: Never fails or returns an error message to the user.
 */

import { generateLocalPulseBotResponse } from './localNutritionEngine';

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

/**
 * Gets candidate Gemini API keys configured in the environment or localStorage.
 */
function getCandidateApiKeys() {
  const keys = [];
  
  // 1. User custom key from localStorage
  try {
    const userCustomKey = localStorage.getItem('fitpulse_custom_gemini_key');
    if (userCustomKey && userCustomKey.trim().length > 10) {
      keys.push(userCustomKey.trim());
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  // 2. Environment variables
  const envGemini = import.meta.env.VITE_GEMINI_API_KEY;
  if (envGemini && typeof envGemini === 'string' && envGemini.trim().length > 10) {
    keys.push(envGemini.trim());
  }

  const envFirebase = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envFirebase && typeof envFirebase === 'string' && envFirebase.trim().length > 10 && !keys.includes(envFirebase.trim())) {
    keys.push(envFirebase.trim());
  }

  return keys;
}

/**
 * Calls Gemini REST API directly for chat generation.
 */
async function callGeminiChatApi(apiKey, modelName, contents, systemInstruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('EMPTY_GEMINI_RESPONSE');
  }

  return textOutput;
}

/**
 * Generates a specialized response from PulseBot for nutrition and fitness guidance.
 *
 * @param {string} userMessage
 * @param {Array<{role: string, text: string}>} history
 * @param {object} userContext
 * @returns {Promise<string>}
 */
export async function sendNutritionChatMessage(userMessage, history = [], userContext = {}) {
  if (!userMessage || !userMessage.trim()) {
    return 'Por favor, digite uma mensagem para conversar com o PulseBot.';
  }

  const calorieGoal = Number(userContext.calorieGoal) || 2000;
  const consumedCalories = Number(userContext.consumedCalories) || 0;
  const remainingCalories = Math.max(0, calorieGoal - consumedCalories);

  const proteinGoal = Number(userContext.proteinGoal) || 150;
  const carbsGoal = Number(userContext.carbsGoal) || 200;
  const fatGoal = Number(userContext.fatGoal) || 60;
  const hydrationGoal = Number(userContext.hydrationGoal) || 2500;
  const consumedHydration = Number(userContext.consumedHydration) || 0;

  const systemInstruction = `Você é o PulseBot, o assistente virtual de nutrição e treinamento do FitPulseAI. Seja motivador, técnico e conciso, adaptando respostas às metas e perfil calórico do usuário.

CONTEXTO EM TEMPO REAL DO USUÁRIO:
- Nome: ${userContext.name || 'Atleta'}
- Objetivo: ${userContext.goal || 'Saúde e Performance'}
- Meta Calórica Diária: ${calorieGoal} kcal
- Calorias Consumidas Hoje: ${consumedCalories} kcal
- Calorias Restantes: ${remainingCalories} kcal
- Metas de Macronutrientes: Proteína ${proteinGoal}g | Carboidratos ${carbsGoal}g | Gordura ${fatGoal}g
- Consumo de Macronutrientes Hoje: Proteína ${userContext.consumedProtein || 0}g | Carboidratos ${userContext.consumedCarbs || 0}g | Gordura ${userContext.consumedFat || 0}g
- Hidratação: ${consumedHydration}ml consumidos de ${hydrationGoal}ml (Meta)

DIRETRIZES DE RESPOSTA DO PULSEBOT:
1. Seja motivador, empático, altamente técnico e direto ao ponto (máximo de 2 a 3 parágrafos curtos).
2. Se o usuário perguntar o que comer agora, considere estritamente as calorias e macronutrientes que RESTAM no dia dele.
3. Dê sugestões de alimentos reais e medidas práticas (ex: "150g de peito de frango grelhado + 100g de batata doce").
4. Se o usuário perguntar sobre treino ou recuperação, forneça instruções claras de execução, descanso e hidratação.
5. Use emojis de forma inteligente e agradável.
6. Responda SEMPRE em Português do Brasil com excelente clareza.
7. Nunca faça diagnósticos médicos clínicos; recomende acompanhamento especializado quando apropriado.`;

  const contents = [];

  // Add conversation history
  if (Array.isArray(history) && history.length > 0) {
    history.forEach((msg) => {
      if (msg && msg.text) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    });
  }

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage.trim() }],
  });

  // 1. TENTA NUVEM GEMINI COM CHAVES CANDIDATAS
  const candidateKeys = getCandidateApiKeys();
  if (candidateKeys.length > 0) {
    for (const key of candidateKeys) {
      for (const model of GEMINI_MODELS) {
        try {
          const cloudPromise = callGeminiChatApi(key, model, contents, systemInstruction);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 8000)
          );

          const result = await Promise.race([cloudPromise, timeoutPromise]);
          if (result) {
            return result;
          }
        } catch (err) {
          console.warn(`[PulseBot] Gemini Cloud (${model}) indisponível:`, err.message);
        }
      }
    }
  }

  // 2. FALLBACK IMEDIATO: RESPOSTA INTELIGENTE LOCAL CONTEXTUALIZADA
  console.info('[PulseBot] Gerando resposta localmente com contexto do usuário');
  return generateLocalPulseBotResponse(userMessage, userContext);
}

/**
 * Local storage helpers for chat persistence
 */
const CHAT_STORAGE_KEY_PREFIX = 'fitpulse_chat_history_';

export function loadChatHistory(userId = 'guest') {
  try {
    const raw = localStorage.getItem(`${CHAT_STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar histórico de chat local:', err);
  }
  return null;
}

export function saveChatHistory(userId = 'guest', messages = []) {
  try {
    localStorage.setItem(
      `${CHAT_STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(messages.slice(-50))
    );
  } catch (err) {
    console.warn('Erro ao salvar histórico de chat local:', err);
  }
}

export function clearChatHistory(userId = 'guest') {
  try {
    localStorage.removeItem(`${CHAT_STORAGE_KEY_PREFIX}${userId}`);
  } catch (err) {
    console.warn('Erro ao limpar histórico de chat local:', err);
  }
}
