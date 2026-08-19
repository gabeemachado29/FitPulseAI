/**
 * FitPulseAI — Food Analysis Models and Defensive DTOs
 *
 * Provides robust JSON sanitization, defensive type casting, Atwater mathematical validation,
 * and dynamic macro recalculation for real-time user portion adjustments.
 */

/**
 * Strips markdown codeblocks and cleans raw text for safe JSON parsing.
 * @param {string} rawText
 * @returns {any} parsed JSON object
 */
export function cleanAndParseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('EMPTY_RESPONSE');
  }

  let cleaned = rawText.trim();

  // Strip ```json ... ``` or ``` ... ``` wrappers
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  // Also extract the first outermost JSON object if surrounded by extra commentary
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('JSON parse error on cleaned text:', cleaned, err);
    throw new Error('INVALID_JSON_RESPONSE');
  }
}

/**
 * Defensively parses a number value, ensuring it is a non-negative float/int.
 * @param {any} val
 * @param {number} decimals
 * @returns {number}
 */
export function parseDefensiveNumber(val, decimals = 1) {
  if (val === null || val === undefined) return 0;
  let num;
  if (typeof val === 'number') {
    num = val;
  } else if (typeof val === 'string') {
    // Replace comma with dot if user locale uses commas
    const normalized = val.replace(',', '.').replace(/[^0-9.-]/g, '');
    num = parseFloat(normalized);
  } else {
    num = Number(val);
  }

  if (isNaN(num) || !isFinite(num) || num < 0) {
    return 0;
  }

  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Calculates Atwater calories: (Protein * 4) + (Carbs * 4) + (Fats * 9)
 * @param {number} protein
 * @param {number} carbs
 * @param {number} fat
 * @returns {number}
 */
export function calculateAtwaterCalories(protein, carbs, fat) {
  const p = Math.max(0, parseDefensiveNumber(protein, 1));
  const c = Math.max(0, parseDefensiveNumber(carbs, 1));
  const f = Math.max(0, parseDefensiveNumber(fat, 1));
  return Math.round((p * 4) + (c * 4) + (f * 9));
}

/**
 * Parse an individual food item / ingredient defensively.
 * @param {any} rawItem
 * @returns {object} FoodItem
 */
export function parseFoodItem(rawItem) {
  if (!rawItem || typeof rawItem !== 'object') {
    return {
      id: `item_${Math.random().toString(36).substring(2, 9)}`,
      name: 'Ingrediente não identificado',
      serving_description: '1 porção',
      estimated_weight_g: 100,
      calories_kcal: 0,
      protein_g: 0,
      carbohydrates_g: 0,
      fats_g: 0,
      fiber_g: 0,
      base_per_gram: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
    };
  }

  const name = String(rawItem.name || rawItem.item || 'Alimento').trim();
  const serving_description = String(rawItem.serving_description || rawItem.portion || '1 porção').trim();
  const estimated_weight_g = Math.max(1, Math.round(parseDefensiveNumber(rawItem.estimated_weight_g || rawItem.weight_g || rawItem.weight, 0)) || 100);

  const protein_g = parseDefensiveNumber(rawItem.protein_g ?? rawItem.protein);
  const carbohydrates_g = parseDefensiveNumber(rawItem.carbohydrates_g ?? rawItem.carbs ?? rawItem.carbohydrate);
  const fats_g = parseDefensiveNumber(rawItem.fats_g ?? rawItem.fat ?? rawItem.fats);
  const fiber_g = parseDefensiveNumber(rawItem.fiber_g ?? rawItem.fiber ?? rawItem.fibers);

  // Enforce Atwater formula: calories = (P*4) + (C*4) + (G*9)
  const calories_kcal = calculateAtwaterCalories(protein_g, carbohydrates_g, fats_g);

  // Store per-gram ratios so UI can scale accurately when user edits weight
  const weight = estimated_weight_g > 0 ? estimated_weight_g : 100;
  const base_per_gram = {
    protein: protein_g / weight,
    carbs: carbohydrates_g / weight,
    fat: fats_g / weight,
    fiber: fiber_g / weight,
  };

  return {
    id: `item_${Math.random().toString(36).substring(2, 9)}`,
    name: name.substring(0, 100),
    serving_description: serving_description.substring(0, 100),
    estimated_weight_g,
    calories_kcal,
    protein_g,
    carbohydrates_g,
    fats_g,
    fiber_g,
    base_per_gram,
  };
}

/**
 * Recalculates nutrition values for an updated list of items (e.g. after weight adjustment).
 * @param {Array<object>} items
 * @returns {object} { items, total_nutrition }
 */
export function recalculateMealNutrition(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      items: [],
      total_nutrition: {
        calories_kcal: 0,
        protein_g: 0,
        carbohydrates_g: 0,
        fats_g: 0,
        fiber_g: 0,
      },
    };
  }

  const updatedItems = items.map((item) => {
    const weight = Math.max(1, parseDefensiveNumber(item.estimated_weight_g, 0));
    const base = item.base_per_gram || {
      protein: (item.protein_g || 0) / (weight || 100),
      carbs: (item.carbohydrates_g || 0) / (weight || 100),
      fat: (item.fats_g || 0) / (weight || 100),
      fiber: (item.fiber_g || 0) / (weight || 100),
    };

    const protein_g = parseDefensiveNumber(base.protein * weight, 1);
    const carbohydrates_g = parseDefensiveNumber(base.carbs * weight, 1);
    const fats_g = parseDefensiveNumber(base.fat * weight, 1);
    const fiber_g = parseDefensiveNumber(base.fiber * weight, 1);
    const calories_kcal = calculateAtwaterCalories(protein_g, carbohydrates_g, fats_g);

    return {
      ...item,
      estimated_weight_g: weight,
      protein_g,
      carbohydrates_g,
      fats_g,
      fiber_g,
      calories_kcal,
      base_per_gram: base,
    };
  });

  const totalProtein = parseDefensiveNumber(updatedItems.reduce((sum, it) => sum + it.protein_g, 0), 1);
  const totalCarbs = parseDefensiveNumber(updatedItems.reduce((sum, it) => sum + it.carbohydrates_g, 0), 1);
  const totalFats = parseDefensiveNumber(updatedItems.reduce((sum, it) => sum + it.fats_g, 0), 1);
  const totalFiber = parseDefensiveNumber(updatedItems.reduce((sum, it) => sum + it.fiber_g, 0), 1);
  const totalCalories = calculateAtwaterCalories(totalProtein, totalCarbs, totalFats);

  return {
    items: updatedItems,
    total_nutrition: {
      calories_kcal: totalCalories,
      protein_g: totalProtein,
      carbohydrates_g: totalCarbs,
      fats_g: totalFats,
      fiber_g: totalFiber,
    },
  };
}

/**
 * Defensive parser for the full FoodAnalysisResult DTO.
 * @param {any} raw
 * @param {string} fallbackInputMode
 * @returns {object} FoodAnalysisResult
 */
export function parseFoodAnalysisResult(raw, fallbackInputMode = 'hybrid') {
  if (!raw || typeof raw !== 'object') {
    return {
      is_food: false,
      confidence: 'low',
      input_mode: fallbackInputMode,
      meal_summary: 'Entrada não reconhecida',
      total_nutrition: { calories_kcal: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, fiber_g: 0 },
      items: [],
      health_insights: ['Não foi possível identificar informações nutricionais válidas.'],
      notes: 'Entrada inválida ou resposta vazia.',
    };
  }

  const is_food = typeof raw.is_food === 'boolean' ? raw.is_food : true;
  const confidence = ['high', 'medium', 'low', 'alta', 'media', 'baixa'].includes(String(raw.confidence).toLowerCase())
    ? (raw.confidence === 'alta' ? 'high' : raw.confidence === 'media' ? 'medium' : raw.confidence === 'baixa' ? 'low' : raw.confidence.toLowerCase())
    : 'high';

  const validModes = ['image', 'text', 'hybrid'];
  const input_mode = validModes.includes(raw.input_mode) ? raw.input_mode : fallbackInputMode;

  const meal_summary = String(raw.meal_summary || raw.name || 'Refeição Analisada').trim();
  const notes = String(raw.notes || raw.explanation || '').trim();

  const health_insights = Array.isArray(raw.health_insights)
    ? raw.health_insights.map((h) => String(h).trim()).filter(Boolean)
    : (raw.explanation ? [String(raw.explanation).trim()] : []);

  if (!is_food) {
    return {
      is_food: false,
      confidence,
      input_mode,
      meal_summary: meal_summary || 'Nenhum alimento identificado',
      total_nutrition: { calories_kcal: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, fiber_g: 0 },
      items: [],
      health_insights,
      notes: notes || 'A imagem ou descrição fornecida não parece conter itens alimentícios.',
    };
  }

  // Parse items
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const parsedItems = rawItems.map(parseFoodItem);

  // Compute or validate total nutrition
  let totalProtein = parseDefensiveNumber(raw.total_nutrition?.protein_g ?? raw.protein, 1);
  let totalCarbs = parseDefensiveNumber(raw.total_nutrition?.carbohydrates_g ?? raw.carbs, 1);
  let totalFats = parseDefensiveNumber(raw.total_nutrition?.fats_g ?? raw.fat, 1);
  let totalFiber = parseDefensiveNumber(raw.total_nutrition?.fiber_g ?? raw.fiber, 1);

  // If items exist, verify sum from items to maintain mathematical integrity
  if (parsedItems.length > 0) {
    const sumP = parsedItems.reduce((acc, it) => acc + it.protein_g, 0);
    const sumC = parsedItems.reduce((acc, it) => acc + it.carbohydrates_g, 0);
    const sumF = parsedItems.reduce((acc, it) => acc + it.fats_g, 0);
    const sumFib = parsedItems.reduce((acc, it) => acc + it.fiber_g, 0);

    totalProtein = parseDefensiveNumber(sumP, 1);
    totalCarbs = parseDefensiveNumber(sumC, 1);
    totalFats = parseDefensiveNumber(sumF, 1);
    totalFiber = parseDefensiveNumber(sumFib, 1);
  }

  const totalCalories = calculateAtwaterCalories(totalProtein, totalCarbs, totalFats);

  return {
    is_food: true,
    confidence,
    input_mode,
    meal_summary: meal_summary.substring(0, 100),
    total_nutrition: {
      calories_kcal: totalCalories,
      protein_g: totalProtein,
      carbohydrates_g: totalCarbs,
      fats_g: totalFats,
      fiber_g: totalFiber,
    },
    items: parsedItems,
    health_insights: health_insights.length > 0 ? health_insights : ['Refeição balanceada calculada com base na Tabela TACO / USDA.'],
    notes,
  };
}
