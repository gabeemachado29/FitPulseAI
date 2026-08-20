/**
 * FitPulseAI — PulseBot AI Nutrition & Training Assistant Chat Service
 * Powered by Google Gemini 1.5 Flash with full context injection & key resilience.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiKeyManager } from './geminiKeyManager';

const SUPPORTED_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-flash-latest',
];

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

  return await GeminiKeyManager.executeWithFallback(
    async (apiKey) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      let lastModelErr = null;

      for (const modelName of SUPPORTED_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          });

          const result = await model.generateContent({ contents });
          const textOutput = result.response?.text?.();

          if (textOutput) {
            return textOutput;
          }
        } catch (err) {
          console.warn(`[PulseBot] Falha com modelo ${modelName}:`, err.message);
          lastModelErr = err;

          if (GeminiKeyManager.isRateLimitError(err)) {
            throw err;
          }

          if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('no longer available')) {
            continue;
          }

          continue;
        }
      }

      throw lastModelErr || new Error('EMPTY_RESPONSE');
    },
    { timeoutMs: 30000 }
  );
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
      JSON.stringify(messages.slice(-50)) // Keep last 50 messages
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
