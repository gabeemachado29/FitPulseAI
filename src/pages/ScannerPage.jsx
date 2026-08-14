import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Type } from 'lucide-react';
import PillToggle from '../components/ui/PillToggle';
import PhotoScanner from '../components/scanner/PhotoScanner';
import TextScanner from '../components/scanner/TextScanner';
import ScanResult from '../components/scanner/ScanResult';
import Loader from '../components/ui/Loader';
import { useNutrition } from '../hooks/useNutrition';
import { useToastStore } from '../store/toastStore';
import { analyzeTextMeal, analyzePhotoMeal } from '../services/aiScannerService';
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

  const handleAnalyzeText = async (description) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const data = await analyzeTextMeal(description);
      setResult(data);
    } catch (err) {
      console.error('Error analyzing text meal:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzePhoto = async (base64Data, mimeType) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzePhotoMeal(base64Data, mimeType);
      setResult(data);
    } catch (err) {
      console.error('Error analyzing photo meal:', err);
    } finally {
      setAnalyzing(false);
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
        source: activeTab,
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
          }}
          fullWidth
          size="lg"
        />
      </div>



      {analyzing ? (
        <div className={styles.analyzingWrap}>
          <Loader size={40} />
          <p className={styles.analyzingText}>
            A IA está analisando sua refeição...
          </p>
        </div>
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
