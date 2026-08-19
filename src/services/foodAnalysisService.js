/**
 * FitPulseAI — Food Analysis Service Bridge
 * Exports the official FoodAnalysisService and utility methods.
 */

export {
  FoodAnalysisService,
  analyzeFood,
  analyzeMeal,
  analyzePhotoMeal,
  analyzeTextMeal,
  getAIErrorMessage,
  SYSTEM_INSTRUCTION,
  FOOD_ANALYSIS_RESPONSE_SCHEMA,
} from './aiScannerService';

export {
  cleanAndParseJson,
  parseFoodAnalysisResult,
  recalculateMealNutrition,
  calculateAtwaterCalories,
  parseDefensiveNumber,
  parseFoodItem,
} from './foodAnalysisModels';
