/**
 * FitPulseAI — High-Precision Multimodal Food AI Service
 * Powered by Google Gemini 1.5 Flash with Native Structured Outputs (Response Schema).
 */

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { compressImage } from './imageUtils';
import { parseFoodAnalysisResult, cleanAndParseJson } from './foodAnalysisModels';

const GEMINI_MODEL = 'gemini-1.5-flash';

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
 * Instrução de Sistema (System Instruction) para Inteligência Nutricional
 */
export const SYSTEM_INSTRUCTION = `Você é o motor de visão computacional e inteligência nutricional do FitPulseAI.
Analise a entrada alimentar (imagem, texto ou ambos) e calcule os macronutrientes com base nas tabelas TACO e USDA.
1. Se for imagem: estime volumes, densidade e converta para gramas.
2. Se for texto: converta medidas caseiras em gramas e calcule os macros.
3. Se for imagem + texto: priorize as observações de texto para ingredientes ocultos (ex: óleos, açúcar, modo de preparo).
4. Aplique a consistência matemática: Calorias = (Proteínas * 4) + (Carboidratos * 4) + (Gorduras * 9).
5. Se não houver alimento identificável, retorne 'is_food': false.`;

/**
 * Esquema estruturado JSON estrito oficial da API Google Gemini
 */
export const FOOD_ANALYSIS_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    is_food: {
      type: SchemaType.BOOLEAN,
      description: 'true se houver alimento identificável, false caso contrário',
    },
    confidence: {
      type: SchemaType.STRING,
      enum: ['high', 'medium', 'low'],
      description: 'Nível de certeza da identificação',
    },
    input_mode: {
      type: SchemaType.STRING,
      enum: ['image', 'text', 'hybrid'],
      description: 'Modalidade de entrada utilizada',
    },
    meal_summary: {
      type: SchemaType.STRING,
      description: 'Nome descritivo da refeição ou motivo se não for alimento',
    },
    total_nutrition: {
      type: SchemaType.OBJECT,
      properties: {
        calories_kcal: { type: SchemaType.NUMBER, description: 'Calorias totais exatas = (P*4) + (C*4) + (G*9)' },
        protein_g: { type: SchemaType.NUMBER, description: 'Proteína total em gramas' },
        carbohydrates_g: { type: SchemaType.NUMBER, description: 'Carboidratos totais em gramas' },
        fats_g: { type: SchemaType.NUMBER, description: 'Gordura total em gramas' },
        fiber_g: { type: SchemaType.NUMBER, description: 'Fibras totais em gramas' },
      },
      required: ['calories_kcal', 'protein_g', 'carbohydrates_g', 'fats_g', 'fiber_g'],
    },
    items: {
      type: SchemaType.ARRAY,
      description: 'Lista de cada ingrediente ou item individual identificado',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: 'Nome do ingrediente ou item' },
          serving_description: { type: SchemaType.STRING, description: 'Descrição da porção e medidas' },
          estimated_weight_g: { type: SchemaType.NUMBER, description: 'Peso estimado em gramas' },
          calories_kcal: { type: SchemaType.NUMBER, description: 'Calorias do item = (P*4) + (C*4) + (G*9)' },
          protein_g: { type: SchemaType.NUMBER, description: 'Proteína em gramas' },
          carbohydrates_g: { type: SchemaType.NUMBER, description: 'Carboidratos em gramas' },
          fats_g: { type: SchemaType.NUMBER, description: 'Gordura em gramas' },
          fiber_g: { type: SchemaType.NUMBER, description: 'Fibras em gramas' },
        },
        required: [
          'name',
          'serving_description',
          'estimated_weight_g',
          'calories_kcal',
          'protein_g',
          'carbohydrates_g',
          'fats_g',
          'fiber_g',
        ],
      },
    },
    health_insights: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Dicas práticas ou observações nutricionais relevantes',
    },
    notes: {
      type: SchemaType.STRING,
      description: 'Observações sobre preparo ou inferências',
    },
  },
  required: [
    'is_food',
    'confidence',
    'input_mode',
    'meal_summary',
    'total_nutrition',
    'items',
    'health_insights',
    'notes',
  ],
};

/**
 * Classe de Serviço FoodAnalysisService
 */
export class FoodAnalysisService {
  /**
   * Método unificado para análise alimentar por IA com Google Gemini 1.5 Flash.
   * Suporta imagem (bytes, File, ou Base64), texto ou ambos combinados.
   *
   * @param {object} params
   * @param {Uint8List|ArrayBuffer|null} [params.imageBytes]
   * @param {string|null} [params.imageBase64]
   * @param {File|Blob|null} [params.imageFile]
   * @param {string} [params.mimeType='image/jpeg']
   * @param {string|null} [params.textDescription]
   * @returns {Promise<import('./foodAnalysisModels').FoodAnalysisResult>}
   */
  static async analyzeFood({
    imageBytes = null,
    imageBase64 = null,
    imageFile = null,
    mimeType = 'image/jpeg',
    textDescription = '',
  } = {}) {
    const rawImage = imageFile || imageBytes || imageBase64;
    const hasImage = Boolean(rawImage);
    const hasText = Boolean(textDescription && typeof textDescription === 'string' && textDescription.trim().length > 0);

    if (!hasImage && !hasText) {
      throw new Error('VALIDATION_ERROR: Forneça uma foto ou descreva sua refeição por texto.');
    }

    let inputMode = 'text';
    if (hasImage && hasText) {
      inputMode = 'hybrid';
    } else if (hasImage) {
      inputMode = 'image';
    }

    const apiKey = getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: FOOD_ANALYSIS_RESPONSE_SCHEMA,
        temperature: 0.1, // Evita alucinações matemáticas
      },
    });

    const parts = [];

    // Se houver imagem, comprime para JPEG 1024x1024 com 85% de qualidade
    if (hasImage) {
      let base64Data = '';
      let targetMime = mimeType || 'image/jpeg';

      if (typeof rawImage === 'string' && !rawImage.startsWith('data:') && !rawImage.startsWith('http')) {
        // Raw base64 string
        const comp = await compressImage(`data:${targetMime};base64,${rawImage}`, 1024, 0.85);
        base64Data = comp.base64;
        targetMime = comp.mimeType || targetMime;
      } else {
        const comp = await compressImage(rawImage, 1024, 0.85);
        base64Data = comp.base64;
        targetMime = comp.mimeType || targetMime;
      }

      parts.push({
        inlineData: {
          mimeType: targetMime,
          data: base64Data,
        },
      });

      if (hasText) {
        parts.push({
          text: `[INSTRUÇÃO HÍBRIDA FOTO + TEXTO]\nObserve a imagem da refeição e utilize OBRIGATORIAMENTE os seguintes detalhes adicionais fornecidos pelo usuário para ajustar ingredientes ocultos, modo de preparo e porções:\n"${textDescription.trim()}"`,
        });
      } else {
        parts.push({
          text: 'Identifique minuciosamente os alimentos nesta foto e calcule a decomposição nutricional exata.',
        });
      }
    } else {
      // Apenas texto
      parts.push({
        text: `[INSTRUÇÃO DE TEXTO]\nDecomponha e analise detalhadamente todos os ingredientes, medidas caseiras e nutrientes desta refeição descrita pelo usuário:\n"${textDescription.trim()}"`,
      });
    }

    try {
      const response = await model.generateContent(parts);
      const textOutput = response.response?.text?.();

      if (!textOutput) {
        throw new Error('EMPTY_RESPONSE');
      }

      const parsedJson = cleanAndParseJson(textOutput);
      return parseFoodAnalysisResult(parsedJson, inputMode);
    } catch (err) {
      console.error('❌ Erro na chamada do Gemini SDK:', err);
      throw err;
    }
  }
}

/**
 * Funções utilitárias exportadas para compatibilidade
 */
export async function analyzeFood(params) {
  return FoodAnalysisService.analyzeFood(params);
}

export async function analyzeMeal(params) {
  return FoodAnalysisService.analyzeFood(params);
}

export async function analyzePhotoMeal(base64Data, mimeType = 'image/jpeg') {
  const result = await FoodAnalysisService.analyzeFood({ imageBase64: base64Data, mimeType });
  return {
    ...result,
    name: result.meal_summary,
    calories: result.total_nutrition.calories_kcal,
    protein: result.total_nutrition.protein_g,
    carbs: result.total_nutrition.carbohydrates_g,
    fat: result.total_nutrition.fats_g,
    fiber: result.total_nutrition.fiber_g,
    explanation: result.notes || result.health_insights?.[0] || 'Análise calculada com base na Tabela TACO/USDA.',
    source: 'ai_photo',
  };
}

export async function analyzeTextMeal(description) {
  const result = await FoodAnalysisService.analyzeFood({ textDescription: description });
  return {
    ...result,
    name: result.meal_summary,
    calories: result.total_nutrition.calories_kcal,
    protein: result.total_nutrition.protein_g,
    carbs: result.total_nutrition.carbohydrates_g,
    fat: result.total_nutrition.fats_g,
    fiber: result.total_nutrition.fiber_g,
    explanation: result.notes || result.health_insights?.[0] || 'Análise calculada com base na Tabela TACO/USDA.',
    source: 'ai_text',
  };
}

/**
 * Mensagens amigáveis para tratamento de erros
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
  if (str.includes('CONTENT_BLOCKED') || str.includes('SAFETY')) {
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
