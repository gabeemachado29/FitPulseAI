import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, HelpCircle, UtensilsCrossed } from 'lucide-react';
import MultimodalScannerInput from '../components/scanner/MultimodalScannerInput';
import ScanResult from '../components/scanner/ScanResult';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';
import { useNutrition } from '../hooks/useNutrition';
import { useToastStore } from '../store/toastStore';
import { analyzeMeal, getAIErrorMessage } from '../services/aiScannerService';
import styles from './ScannerPage.module.css';

export default function ScannerPage() {
  const navigate = useNavigate();
  const { addMeal } = useNutrition();
  const addToast = useToastStore((state) => state.addToast);

  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [nonFoodWarning, setNonFoodWarning] = useState(null);

  // Store last input state for retrying
  const [lastInput, setLastInput] = useState({ photo: null, text: '' });

  const handleAnalyze = async ({ imageFile, imageBase64, textDescription }) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);
    setNonFoodWarning(null);
    setLastInput({ photo: imageBase64, text: textDescription || '' });

    try {
      const data = await analyzeMeal({
        imageFile,
        imageBase64,
        textDescription,
      });

      // Check if food was identified
      if (data.is_food === false) {
        setNonFoodWarning({
          title: 'Nenhum alimento identificado',
          message: 'Nenhum alimento identificado. Tente enviar uma foto mais nítida ou descrever a refeição por texto.',
          notes: data.notes || data.meal_summary || '',
        });
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error('Error in food analysis:', err);
      setError(getAIErrorMessage(err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetry = () => {
    if (lastInput.photo || lastInput.text) {
      handleAnalyze({
        imageBase64: lastInput.photo,
        textDescription: lastInput.text,
      });
    } else {
      handleReset();
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setNonFoodWarning(null);
  };

  const handleSaveMeal = async (mealData) => {
    setSaving(true);
    try {
      await addMeal({
        description: mealData.description || mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        fiber: mealData.fiber || 0,
        items: mealData.items || [],
        confidence: mealData.confidence || 'high',
        input_mode: mealData.input_mode || 'hybrid',
        health_insights: mealData.health_insights || [],
        notes: mealData.notes || '',
        photoBase64: lastInput.photo || null,
        timestamp: new Date().toISOString(),
      });

      addToast('Refeição adicionada ao diário com sucesso!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Error saving meal to log:', err);
      addToast('Erro ao salvar refeição. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-header__title">Scanner Multimodal de Refeições</h1>
        <p className={styles.headerSubtitle}>
          Analise por foto, por texto ou combinados com inteligência nutricional TACO/USDA
        </p>
      </div>

      {/* Loading State with Glowing Pulse */}
      {analyzing && (
        <div className={styles.analyzingWrap}>
          <div className={styles.radarGlow} />
          <div className={styles.aiIndicator}>
            <Sparkles size={14} />
            <span>Motor Nutricional IA FitPulse</span>
          </div>
          <Loader size={44} />
          <p className={styles.analyzingText}>Analisando refeição com Gemini 3.6 Flash Vision...</p>
          <p className={styles.analyzingSubtext}>
            Decompondo ingredientes, calculando gramas e validando macronutrientes pela equação de Atwater.
          </p>
        </div>
      )}

      {/* Non-Food Alert State (is_food === false) */}
      {!analyzing && nonFoodWarning && (
        <Card variant="bordered" padding="lg" className={styles.errorCard}>
          <div className={styles.errorContent}>
            <div className={`${styles.errorIconWrap} ${styles.errorIconOrange}`}>
              <UtensilsCrossed size={30} color="var(--accent-orange)" />
            </div>
            <h3 className={styles.errorTitle}>{nonFoodWarning.title}</h3>
            <p className={styles.errorMessage}>{nonFoodWarning.message}</p>
            {nonFoodWarning.notes && (
              <div className={styles.errorNotes}>
                <strong>Observação da IA:</strong> {nonFoodWarning.notes}
              </div>
            )}
            <div className={styles.errorActions}>
              <Button variant="primary" fullWidth onClick={handleReset}>
                Tentar novamente com outra foto/texto
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {!analyzing && !nonFoodWarning && error && (
        <Card variant="bordered" padding="lg" className={styles.errorCard}>
          <div className={styles.errorContent}>
            <div className={`${styles.errorIconWrap} ${styles.errorIconRed}`}>
              <AlertTriangle size={30} color="var(--accent-red)" />
            </div>
            <h3 className={styles.errorTitle}>Não foi possível concluir a análise</h3>
            <p className={styles.errorMessage}>{error}</p>
            <div className={styles.errorActions}>
              <Button variant="primary" fullWidth onClick={handleRetry}>
                Tentar novamente
              </Button>
              <Button variant="ghost" fullWidth onClick={handleReset}>
                Voltar ao início
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results View */}
      {!analyzing && !nonFoodWarning && !error && result && (
        <ScanResult
          result={result}
          onSaveMeal={handleSaveMeal}
          onReset={handleReset}
          saving={saving}
        />
      )}

      {/* Main Input View */}
      {!analyzing && !nonFoodWarning && !error && !result && (
        <MultimodalScannerInput
          onAnalyze={handleAnalyze}
          loading={analyzing}
          initialPhoto={lastInput.photo}
          initialText={lastInput.text}
        />
      )}
    </div>
  );
}
