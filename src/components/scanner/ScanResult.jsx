import { Check, RotateCcw, Flame, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import styles from './ScanResult.module.css';

const CONFIDENCE_CONFIG = {
  alta: { icon: ShieldCheck, label: 'Confiança Alta', color: 'var(--accent-green)', bg: 'rgba(0, 230, 118, 0.1)' },
  media: { icon: ShieldAlert, label: 'Confiança Média', color: 'var(--accent-yellow)', bg: 'rgba(255, 214, 0, 0.1)' },
  baixa: { icon: ShieldQuestion, label: 'Confiança Baixa', color: 'var(--accent-orange)', bg: 'rgba(255, 109, 0, 0.1)' },
};

export default function ScanResult({ result, onSaveMeal, onReset, saving }) {
  const [showItems, setShowItems] = useState(false);

  if (!result) return null;

  const { name, calories, protein, carbs, fat, fiber, explanation, confidence, items } = result;
  const conf = CONFIDENCE_CONFIG[confidence] || CONFIDENCE_CONFIG.media;
  const ConfIcon = conf.icon;

  return (
    <Card variant="highlight" padding="lg" className={styles.card}>
      {/* Header: Name + Calorie Badge */}
      <div className={styles.header}>
        <h3 className={styles.title}>{name}</h3>
        <div className={styles.calorieBadge}>
          <Flame size={16} color="var(--accent-orange)" />
          <span>{calories} kcal</span>
        </div>
      </div>

      {/* Confidence Badge */}
      <div className={styles.confidenceBadge} style={{ backgroundColor: conf.bg, color: conf.color, borderColor: conf.color }}>
        <ConfIcon size={14} />
        <span>{conf.label}</span>
      </div>

      {explanation && <p className={styles.explanation}>{explanation}</p>}

      {/* Main Macros Grid */}
      <div className={styles.macrosGrid}>
        <div className={styles.macroBox}>
          <span className={styles.macroVal}>{protein}g</span>
          <span className={styles.macroLabel}>Proteína</span>
        </div>
        <div className={styles.macroBox}>
          <span className={styles.macroVal}>{carbs}g</span>
          <span className={styles.macroLabel}>Carbs</span>
        </div>
        <div className={styles.macroBox}>
          <span className={styles.macroVal}>{fat}g</span>
          <span className={styles.macroLabel}>Gordura</span>
        </div>
        {fiber > 0 && (
          <div className={styles.macroBox}>
            <span className={styles.macroVal}>{fiber}g</span>
            <span className={styles.macroLabel}>Fibras</span>
          </div>
        )}
      </div>

      {/* Individual Items Breakdown */}
      {items && items.length > 0 && (
        <div className={styles.itemsSection}>
          <button
            type="button"
            className={styles.itemsToggle}
            onClick={() => setShowItems(!showItems)}
          >
            <span>🍽️ {items.length} {items.length === 1 ? 'alimento identificado' : 'alimentos identificados'}</span>
            {showItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showItems && (
            <div className={styles.itemsList}>
              {items.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPortion}>{item.portion}</span>
                  </div>
                  <div className={styles.itemMacros}>
                    <span className={styles.itemCal}>{item.calories} kcal</span>
                    <span className={styles.itemDetail}>
                      P{item.protein}g · C{item.carbs}g · G{item.fat}g
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={Check}
          loading={saving}
          onClick={() => onSaveMeal(result)}
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
          Refazer análise
        </Button>
      </div>
    </Card>
  );
}
