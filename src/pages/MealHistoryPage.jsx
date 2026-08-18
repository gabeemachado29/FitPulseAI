import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import MealPhotoGrid from '../components/history/MealPhotoGrid';
import MealPhotoModal from '../components/history/MealPhotoModal';
import { useAuth } from '../hooks/useAuth';
import { fetchMealsWithPhotos } from '../services/nutritionService';

export default function MealHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function loadPhotoHistory() {
      setLoading(true);
      try {
        const photoMeals = await fetchMealsWithPhotos(user.uid);
        setMeals(photoMeals);
      } catch (err) {
        console.error('Error loading photo history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPhotoHistory();
  }, [user]);

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} aria-label="Voltar" />
        <div>
          <h1 className="page-header__title">Histórico de Pratos 📸</h1>
          <p className="page-header__date">Sua evolução visual da dieta</p>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <Loader size={36} />
        </div>
      ) : (
        <MealPhotoGrid meals={meals} onSelectMeal={setSelectedMeal} />
      )}

      {selectedMeal && (
        <MealPhotoModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}
    </div>
  );
}
