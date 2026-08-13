import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, LogOut, Trash2 } from 'lucide-react';
import UserInfo from '../components/profile/UserInfo';
import BodyMeasurements from '../components/profile/BodyMeasurements';
import HealthMetrics from '../components/profile/HealthMetrics';
import DailyGoals from '../components/profile/DailyGoals';
import MacroGoals from '../components/profile/MacroGoals';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateHydrationGoal,
  calculateMacroGoals,
} from '../services/profileService';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    height: 175,
    weight: 114,
    age: 22,
    sex: 'masculino',
    activityLevel: 'sedentario',
    calorieGoal: 2567,
    hydrationGoal: 4025,
    proteinGoal: 230,
    carbsGoal: 251,
    fatGoal: 71,
  });

  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  // Sync profile data when loaded from Firestore
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        ...profile,
      }));
    }
  }, [profile]);

  const handleChangeField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Recalculate health metrics dynamically
  const { bmi, category: bmiCategory } = calculateBMI(
    formData.weight,
    formData.height
  );
  const bmr = calculateBMR(
    formData.weight,
    formData.height,
    formData.age,
    formData.sex
  );
  const tdee = calculateTDEE(bmr, formData.activityLevel);
  const calculatedHydration = calculateHydrationGoal(formData.weight);
  const calculatedMacros = calculateMacroGoals(formData.weight, tdee);

  const handleApplyRecommendation = () => {
    setFormData((prev) => ({
      ...prev,
      calorieGoal: tdee,
      hydrationGoal: calculatedHydration,
      proteinGoal: calculatedMacros.protein,
      carbsGoal: calculatedMacros.carbs,
      fatGoal: calculatedMacros.fat,
    }));
    setSaveNotice('Recomendações aplicadas com sucesso!');
    setTimeout(() => setSaveNotice(''), 3000);
  };

  const handleCalculateMacrosOnly = () => {
    setFormData((prev) => ({
      ...prev,
      proteinGoal: calculatedMacros.protein,
      carbsGoal: calculatedMacros.carbs,
      fatGoal: calculatedMacros.fat,
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setSaveNotice('✓ Perfil salvo com sucesso!');
      setTimeout(() => setSaveNotice(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.'
      )
    ) {
      await logout();
      navigate('/login');
    }
  };

  if (loading && !profile) {
    return (
      <div className="page-container">
        <Loader fullScreen />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-header__title">Perfil</h1>
        <p className="page-header__subtitle">
          Medidas corporais e metas diárias
        </p>
      </div>

      <div className={styles.content}>
        {/* User Card */}
        <UserInfo user={user} />

        {saveNotice && (
          <div className={styles.noticeBanner}>{saveNotice}</div>
        )}

        {/* Body Measurements */}
        <BodyMeasurements data={formData} onChange={handleChangeField} />

        {/* Calculated Health Metrics */}
        <HealthMetrics
          bmi={bmi}
          bmiCategory={bmiCategory}
          tdee={tdee}
          hydration={calculatedHydration}
          bmr={bmr}
          onApplyRecommendation={handleApplyRecommendation}
        />

        {/* Daily Goals */}
        <DailyGoals
          calorieGoal={formData.calorieGoal}
          hydrationGoal={formData.hydrationGoal}
          onCalorieChange={(val) => handleChangeField('calorieGoal', val)}
          onHydrationChange={(val) => handleChangeField('hydrationGoal', val)}
        />

        {/* Macro Goals */}
        <MacroGoals
          protein={formData.proteinGoal}
          carbs={formData.carbsGoal}
          fat={formData.fatGoal}
          onChange={handleChangeField}
          onCalculate={handleCalculateMacrosOnly}
        />

        {/* Save & Account Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            size="lg"
            icon={Check}
            loading={saving}
            onClick={handleSaveProfile}
          >
            Salvar Perfil
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={LogOut}
            onClick={handleLogout}
            className={styles.logoutBtn}
          >
            Sair
          </Button>

          <Button
            variant="danger"
            fullWidth
            icon={Trash2}
            onClick={handleDeleteAccount}
          >
            Excluir Conta
          </Button>
        </div>

        {/* Footer label matching Base44 UI */}
        <p className={styles.footer}>FitTrack • Powered by Base44</p>
      </div>
    </div>
  );
}
