import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Type, AlertTriangle } from 'lucide-react';
import PillToggle from '../components/ui/PillToggle';
import PhotoScanner from '../components/scanner/PhotoScanner';
import TextScanner from '../components/scanner/TextScanner';
import ScanResult from '../components/scanner/ScanResult';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Card from '../components/ui/Card';
import { useNutrition } from '../hooks/useNutrition';
import { useToastStore } from '../store/toastStore';
import { analyzeTextMeal, analyzePhotoMeal, getAIErrorMessage } from '../services/aiScannerService';
import styles from './ScannerPage.module.css';

const TABS = [
  { value: 'foto', label: 'Foto', icon: <Camera size={16} /> },
  { value: 'texto', label: 'Texto', icon: <Type size={16} /> },
];

export default function ScannerPage() {
  const navigate = useNavigate();
  const { addMeal } = useNutrition();

  const addToast = useToastStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState('foto');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Store last input for retry
  const [lastTextInput, setLastTextInput] = useState('');
  const [lastPhotoInput, setLastPhotoInput] = useState(null);

  const handleAnalyzeText = async (description) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);
    setLastTextInput(description);

    try {
      const data = await analyzeTextMeal(description);
      setResult(data);
    } catch (err) {
      console.error('Error analyzing text meal:', err);
      setError(getAIErrorMessage(err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzePhoto = async (base64Data, mimeType) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);
    setLastPhotoInput({ base64Data, mimeType });

    try {
      const data = await analyzePhotoMeal(base64Data, mimeType);
      setResult(data);
    } catch (err) {
      console.error('Error analyzing photo meal:', err);
      setError(getAIErrorMessage(err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetry = () => {
    if (activeTab === 'texto' && lastTextInput) {
      handleAnalyzeText(lastTextInput);
    } else if (activeTab === 'foto' && lastPhotoInput) {
      handleAnalyzePhoto(lastPhotoInput.base64Data, lastPhotoInput.mimeType);
    } else {
      setError(null);
    }
  };

  const handleSaveMeal = async (mealData) => {
    setSaving(true);
    try {
      await addMeal({
        description: mealData.name,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        fiber: mealData.fiber || 0,
        items: mealData.items || [],
        confidence: mealData.confidence || 'media',
        source: mealData.source || activeTab,
        photoBase64: activeTab === 'foto' ? lastPhotoInput?.base64Data : null,
        timestamp: new Date().toISOString(),
      });
      addToast('Refeição salva com sucesso!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      console.error('Error saving meal:', err);
      addToast('Erro ao salvar refeição.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-header__title">Scanner de Refeições</h1>
        <p className="page-header__subtitle">
          Por foto ou por descrição — a IA calcula as calorias
        </p>
      </div>

      <div className={styles.tabWrap}>
        <PillToggle
          options={TABS}
          value={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setResult(null);
            setError(null);
          }}
          fullWidth
          size="lg"
        />
      </div>

      {analyzing ? (
        <div className={styles.analyzingWrap}>
          <Loader size={40} />
          <p className={styles.analyzingText}>
            {activeTab === 'foto'
              ? 'Analisando sua foto com Gemini 2.5 Flash...'
              : 'A IA está analisando sua refeição...'}
          </p>
          <p className={styles.analyzingSubtext}>
            Identificando alimentos e calculando macros
          </p>
        </div>
      ) : error ? (
        <Card variant="bordered" padding="lg" className={styles.errorCard}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <AlertTriangle size={32} color="var(--accent-orange)" />
            </div>
            <h3 className={styles.errorTitle}>Não foi possível analisar</h3>
            <p className={styles.errorMessage}>{error}</p>
            <div className={styles.errorActions}>
              <Button
                variant="primary"
                fullWidth
                onClick={handleRetry}
              >
                Tentar novamente
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setError(null);
                  setResult(null);
                }}
              >
                Voltar ao scanner
              </Button>
            </div>
          </div>
        </Card>
      ) : result ? (
        <ScanResult
          result={result}
          onSaveMeal={handleSaveMeal}
          onReset={() => setResult(null)}
          saving={saving}
        />
      ) : activeTab === 'foto' ? (
        <PhotoScanner onAnalyzePhoto={handleAnalyzePhoto} loading={analyzing} />
      ) : (
        <TextScanner onAnalyzeText={handleAnalyzeText} loading={analyzing} />
      )}
    </div>
  );
}
