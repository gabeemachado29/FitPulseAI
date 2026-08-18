/**
 * FitPulseAI — AI Nutrition Assistant Chat Service
 * Powered by Gemini 1.5 Flash with full user context injection.
 */

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return reply || 'Desculpe, não consegui processar sua pergunta. Tente novamente!';
  } catch (err) {
    console.error('Error in AI nutrition chat:', err);
    return 'Tive um problema ao conectar com a IA. Por favor, tente novamente em instantes.';
  }
}
