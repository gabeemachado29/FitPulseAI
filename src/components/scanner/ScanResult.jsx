import { useState, useEffect } from 'react';
import {
  Check,
  RotateCcw,
  Flame,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Lightbulb,
  Info,
  Layers,
  Camera,
  Edit3,
  Sparkles,
  Plus,
  Minus,
  Sliders,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { recalculateMealNutrition } from '../../services/foodAnalysisModels';
import styles from './ScanResult.module.css';

const CONFIDENCE_CONFIG = {
  high: { icon: ShieldCheck, label: 'Confiança Alta', color: 'var(--accent-green)', bg: 'rgba(0, 230, 118, 0.1)' },
  medium: { icon: ShieldAlert, label: 'Confiança Média', color: 'var(--accent-yellow)', bg: 'rgba(255, 214, 0, 0.1)' },
  low: { icon: ShieldQuestion, label: 'Confiança Baixa', color: 'var(--accent-orange)', bg: 'rgba(255, 109, 0, 0.1)' },
};

const MODE_CONFIG = {
  image: { label: 'Visão por Foto', icon: Camera },
  text: { label: 'Entrada por Texto', icon: Edit3 },
  hybrid: { label: 'Híbrido (Foto + Texto)', icon: Sparkles },
};

export default function ScanResult({ result, onSaveMeal, onReset, saving }) {
  const [currentMeal, setCurrentMeal] = useState(result);

  // Sync state if result changes
  useEffect(() => {
    if (result) {
      setCurrentMeal(result);
    }
  }, [result]);

  if (!currentMeal) return null;

  const {
    meal_summary,
    total_nutrition,
    items = [],
    confidence = 'high',
    input_mode = 'hybrid',
    health_insights = [],
    notes = '',
  } = currentMeal;

  const conf = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.high;
  const ConfIcon = conf.icon;
  const mode = MODE_CONFIG[input_mode] || MODE_CONFIG.hybrid;
  const ModeIcon = mode.icon;

  const totalKcal = Math.max(1, total_nutrition?.calories_kcal || 0);
  const pKcal = (total_nutrition?.protein_g || 0) * 4;
  const cKcal = (total_nutrition?.carbohydrates_g || 0) * 4;
  const fKcal = (total_nutrition?.fats_g || 0) * 9;
  const calculatedSumKcal = Math.max(1, pKcal + cKcal + fKcal);

  const proteinPct = Math.round((pKcal / calculatedSumKcal) * 100);
  const carbsPct = Math.round((cKcal / calculatedSumKcal) * 100);
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  // Handle changing an individual item's weight in grams
  const handleWeightChange = (index, newWeight) => {
    const validWeight = Math.max(1, Math.min(2000, Number(newWeight) || 1));
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      estimated_weight_g: validWeight,
    };

    const recalculated = recalculateMealNutrition(newItems);
    setCurrentMeal((prev) => ({
      ...prev,
      items: recalculated.items,
      total_nutrition: recalculated.total_nutrition,
    }));
  };

  const handleStepper = (index, delta) => {
    const currentWeight = items[index]?.estimated_weight_g || 100;
    handleWeightChange(index, currentWeight + delta);
  };

  const handleSave = () => {
    // Adapt to save schema expected by nutrition log
    const payload = {
      name: meal_summary || 'Refeição Analisada',
      description: meal_summary || 'Refeição Analisada',
      calories: total_nutrition.calories_kcal,
      protein: total_nutrition.protein_g,
      carbs: total_nutrition.carbohydrates_g,
      fat: total_nutrition.fats_g,
      fiber: total_nutrition.fiber_g || 0,
      items: currentMeal.items || [],
      confidence: currentMeal.confidence || 'high',
      input_mode: currentMeal.input_mode || 'hybrid',
      health_insights: currentMeal.health_insights || [],
      notes: currentMeal.notes || '',
    };
    onSaveMeal(payload);
  };

  return (
    <Card variant="highlight" padding="lg" className={styles.card}>
      {/* 1. Header: Meal Name, Badges & Calories */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>{meal_summary}</h2>
          <div className={styles.badgesRow}>
            <div
              className={styles.confidenceBadge}
              style={{ backgroundColor: conf.bg, color: conf.color, borderColor: conf.color }}
            >
              <ConfIcon size={12} />
              <span>{conf.label}</span>
            </div>

            <div className={styles.modeBadge}>
              <ModeIcon size={12} />
              <span>{mode.label}</span>
            </div>
          </div>
        </div>

        <div className={styles.calorieBadge}>
          <div className={styles.calorieVal}>
            <Flame size={20} color="var(--accent-orange)" />
            <span>{total_nutrition.calories_kcal}</span>
          </div>
          <span className={styles.calorieSub}>kcal totais</span>
        </div>
      </div>

      {/* 2. Total Macronutrient Breakdown & Progress Distribution */}
      <div className={styles.macroSection}>
        <div className={styles.macroGrid}>
          <div className={styles.macroPill} style={{ '--pill-color': 'var(--accent-green)' }}>
            <span className={styles.macroVal}>{total_nutrition.protein_g}g</span>
            <span className={styles.macroLabel}>Proteínas</span>
            <span className={styles.macroPct}>{proteinPct}%</span>
          </div>
          <div className={styles.macroPill} style={{ '--pill-color': 'var(--accent-yellow)' }}>
            <span className={styles.macroVal}>{total_nutrition.carbohydrates_g}g</span>
            <span className={styles.macroLabel}>Carboidratos</span>
            <span className={styles.macroPct}>{carbsPct}%</span>
          </div>
          <div className={styles.macroPill} style={{ '--pill-color': 'var(--accent-orange)' }}>
            <span className={styles.macroVal}>{total_nutrition.fats_g}g</span>
            <span className={styles.macroLabel}>Gorduras</span>
            <span className={styles.macroPct}>{fatsPct}%</span>
          </div>
          <div className={styles.macroPill} style={{ '--pill-color': 'var(--accent-teal)' }}>
            <span className={styles.macroVal}>{total_nutrition.fiber_g || 0}g</span>
            <span className={styles.macroLabel}>Fibras</span>
            <span className={styles.macroPct}>TACO</span>
          </div>
        </div>

        {/* Stacked Macro Distribution Bar */}
        <div className={styles.distributionWrap}>
          <div className={styles.distributionLabelRow}>
            <span>Distribuição Calórica (Atwater)</span>
            <span>{total_nutrition.calories_kcal} kcal</span>
          </div>
          <div className={styles.distributionBar}>
            <div className={styles.barProtein} style={{ width: `${proteinPct}%` }} title={`Proteínas: ${proteinPct}%`} />
            <div className={styles.barCarbs} style={{ width: `${carbsPct}%` }} title={`Carboidratos: ${carbsPct}%`} />
            <div className={styles.barFats} style={{ width: `${fatsPct}%` }} title={`Gorduras: ${fatsPct}%`} />
          </div>
        </div>
      </div>

      {/* 3. Interactive Items Deconstruction with Weight Stepper */}
      {items.length > 0 && (
        <div className={styles.itemsSection}>
          <div className={styles.itemsHeader}>
            <div className={styles.itemsHeaderTitle}>
              <Layers size={16} />
              <span>Itens Identificados ({items.length})</span>
            </div>
            <span className={styles.editHint}>
              <Sliders size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Ajuste as gramas para recalcular
            </span>
          </div>

          <div className={styles.itemsList}>
            {items.map((item, index) => (
              <div key={item.id || index} className={styles.itemCard}>
                <div className={styles.itemTopRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPortion}>{item.serving_description}</span>
                  </div>
                  <span className={styles.itemCalories}>{item.calories_kcal} kcal</span>
                </div>

                <div className={styles.itemBottomRow}>
                  {/* Weight Editor with +/- buttons */}
                  <div className={styles.weightEditor}>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      onClick={() => handleStepper(index, -10)}
                      title="Diminuir 10g"
                      aria-label="Diminuir peso"
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      type="number"
                      className={styles.weightInput}
                      value={item.estimated_weight_g}
                      onChange={(e) => handleWeightChange(index, e.target.value)}
                      min="1"
                      max="2000"
                    />
                    <span className={styles.weightUnit}>g</span>
                    <button
                      type="button"
                      className={styles.stepperBtn}
                      onClick={() => handleStepper(index, 10)}
                      title="Aumentar 10g"
                      aria-label="Aumentar peso"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className={styles.itemMacrosInline}>
                    <span className={styles.macroTag}>
                      P: <span>{item.protein_g}g</span>
                    </span>
                    <span className={styles.macroTag}>
                      C: <span>{item.carbohydrates_g}g</span>
                    </span>
                    <span className={styles.macroTag}>
                      G: <span>{item.fats_g}g</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Health Insights */}
      {health_insights.length > 0 && (
        <div className={styles.insightsCard}>
          <div className={styles.insightHeader}>
            <Lightbulb size={16} />
            <span>Insights Nutricionais</span>
          </div>
          <ul className={styles.insightList}>
            {health_insights.map((insight, idx) => (
              <li key={idx} className={styles.insightItem}>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. Notes / Inferences */}
      {notes && (
        <div className={styles.notesCard}>
          <Info size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--text-muted)' }} />
          <span>{notes}</span>
        </div>
      )}

      {/* 6. Action CTAs */}
      <div className={styles.actions}>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={Check}
          loading={saving}
          onClick={handleSave}
        >
          Adicionar à Nutrição de Hoje
        </Button>
        <Button
          variant="ghost"
          fullWidth
          icon={RotateCcw}
          onClick={onReset}
          disabled={saving}
        >
          Nova Análise
        </Button>
      </div>
    </Card>
  );
}
