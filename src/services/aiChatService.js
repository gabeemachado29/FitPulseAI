/**
 * FitPulseAI — AI Nutrition Assistant Chat Service
 * Powered by Google Gemini Flash with full user context injection.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPPORTED_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

export async function sendNutritionChatMessage(userMessage, history = [], userContext = {}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim() || apiKey.includes('your_gemini')) {
    return 'Desculpe, a chave da API do Gemini não está configurada nas variáveis de ambiente.';
  }

  const systemPrompt = `Você é o FitPulse AI 🤖, um assistente nutricional e esportivo pessoal empático, motivador e especialista em nutrição esportiva.

CONTEXTO ATUAL DO USUÁRIO:
- Nome: ${userContext.name || 'Atleta'}
- Meta Calórica Diária: ${userContext.calorieGoal || 2000} kcal
- Consumido Hoje: ${userContext.consumedCalories || 0} kcal
- Calorias Restantes: ${Math.max(0, (userContext.calorieGoal || 2000) - (userContext.consumedCalories || 0))} kcal
- Metas de Macros: Proteína ${userContext.proteinGoal || 150}g, Carbs ${userContext.carbsGoal || 200}g, Gordura ${userContext.fatGoal || 60}g
- Consumido de Macros Hoje: Proteína ${userContext.consumedProtein || 0}g, Carbs ${userContext.consumedCarbs || 0}g, Gordura ${userContext.consumedFat || 0}g

DIRETRIZES DE RESPOSTA:
1. Responda de forma direta, motivadora, prática e concisa (máximo 2 a 3 parágrafos curtos)
2. Use emojis adequados para tornar a conversa amigável
3. Dê sugestões de alimentos reais e saudáveis baseadas nas calorias e macros que ainda RESTAM para o usuário
4. Se o usuário perguntar o que comer, dê opções com gramagens estimadas
5. Responda SEMPRE em português do Brasil
6. Nunca dê diagnósticos médicos. Recomende acompanhamento profissional quando apropriado.`;

  const genAI = new GoogleGenerativeAI(apiKey.trim());

  const contents = [];
  if (Array.isArray(history)) {
    history.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  for (const modelName of SUPPORTED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
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
      console.warn(`Chat com modelo ${modelName} falhou:`, err.message);
      if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('no longer available')) {
        continue;
      }
      break;
    }
  }

  return 'Tive um problema ao conectar com a IA. Por favor, tente novamente em instantes.';
}
