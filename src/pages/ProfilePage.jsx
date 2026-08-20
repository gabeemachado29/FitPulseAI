import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  LogOut,
  UserCheck,
  AlertTriangle,
  Camera,
  History,
  Users,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import GoalsOverviewCard from '../components/profile/GoalsOverviewCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import SettingsSection, { applyTheme } from '../components/profile/SettingsSection';
import LGPDPrivacyCard from '../components/profile/LGPDPrivacyCard';
import BodyMeasurements from '../components/profile/BodyMeasurements';
import HealthMetrics from '../components/profile/HealthMetrics';
import ReportExporter from '../components/profile/ReportExporter';
import AchievementGrid from '../components/achievements/AchievementGrid';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useToastStore } from '../store/toastStore';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateHydrationGoal,
  calculateMacroGoals,
} from '../services/profileService';
import styles from './ProfilePage.module.css';

class ProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProfilePage Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container animate-fade-in" style={{ padding: '2rem 1rem' }}>
          <div className="page-header">
            <h1 className="page-header__title">Perfil</h1>
          </div>
          <Card variant="bordered" padding="lg" style={{ textAlign: 'center', margin: '1rem 0' }}>
            <AlertTriangle size={40} color="var(--accent-orange)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Erro na exibição do perfil
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Ocorreu um erro imprevisto ao carregar o perfil.'}
            </p>
            <Button variant="primary" fullWidth onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProfileContent() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, updateProfile } = useProfile();
  const addToast = useToastStore((state) => state.addToast);

  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    height: 175,
    weight: 75,
    age: 25,
    sex: 'masculino',
    activityLevel: 'sedentario',
    goal: 'manutencao',
    workoutDaysPerWeek: 3,
    targetWeight: 75,
    calorieGoal: 2200,
    hydrationGoal: 2625,
    proteinGoal: 150,
    carbsGoal: 220,
    fatGoal: 60,
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
  });

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        ...profile,
        height: Number(profile.height) || prev.height,
        weight: Number(profile.weight) || prev.weight,
        age: Number(profile.age) || prev.age,
        sex: profile.sex || prev.sex,
        activityLevel: profile.activityLevel || prev.activityLevel,
        goal: profile.goal || prev.goal,
        workoutDaysPerWeek: Number(profile.workoutDaysPerWeek) || prev.workoutDaysPerWeek,
        targetWeight: Number(profile.targetWeight) || prev.targetWeight,
        calorieGoal: Number(profile.calorieGoal) || prev.calorieGoal,
        hydrationGoal: Number(profile.hydrationGoal) || prev.hydrationGoal,
        proteinGoal: Number(profile.proteinGoal) || prev.proteinGoal,
        carbsGoal: Number(profile.carbsGoal) || prev.carbsGoal,
        fatGoal: Number(profile.fatGoal) || prev.fatGoal,
      }));
    }
  }, [profile]);

  const handleChangeField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Recalculate health metrics
  const safeWeight = Number(formData.weight) || 75;
  const safeHeight = Number(formData.height) || 175;
  const safeAge = Number(formData.age) || 25;
  const safeSex = formData.sex || 'masculino';
  const safeActivity = formData.activityLevel || 'sedentario';

  const { bmi, category: bmiCategory } = calculateBMI(safeWeight, safeHeight);
  const bmr = calculateBMR(safeWeight, safeHeight, safeAge, safeSex);
  const tdee = calculateTDEE(bmr, safeActivity);
  const calculatedHydration = calculateHydrationGoal(safeWeight, formData.workoutDaysPerWeek);
  const calculatedMacros = calculateMacroGoals(safeWeight, tdee);

  const handleApplyRecommendation = () => {
    setFormData((prev) => ({
      ...prev,
      calorieGoal: tdee,
      hydrationGoal: calculatedHydration,
      proteinGoal: calculatedMacros.protein,
      carbsGoal: calculatedMacros.carbs,
      fatGoal: calculatedMacros.fat,
    }));
    addToast('Recomendações aplicadas com sucesso!', 'success');
  };

  const handleSaveProfileData = async (additionalData = {}) => {
    setSaving(true);
    try {
      const merged = { ...formData, ...additionalData };
      await updateProfile(merged);
      setFormData(merged);
      addToast('Perfil salvo com sucesso!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      addToast('Erro ao salvar perfil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvatar = async (photoDataUrl) => {
    try {
      await updateProfile({ photoURL: photoDataUrl });
      addToast('Foto de perfil atualizada!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao atualizar foto.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-header__title">Meu Perfil</h1>
        <p className="page-header__subtitle">
          Gerenciamento de metas metabólicas, dados e preferências
        </p>
      </div>

      <div className={styles.content}>
        {/* 1. Profile Header with Avatar Upload & Goal Badge */}
        <ProfileHeader
          user={user}
          profile={formData}
          onUpdateAvatar={handleUpdateAvatar}
        />

        {/* 2. Quick Action Edit Profile Button */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            fullWidth
            icon={UserCheck}
            onClick={() => setEditProfileModalOpen(true)}
          >
            Editar Perfil & Senha
          </Button>
          <Button
            variant="primary"
            icon={Check}
            loading={saving}
            onClick={() => handleSaveProfileData()}
          >
            Salvar
          </Button>
        </div>

        {/* 3. Goals Overview Card with Modal */}
        <GoalsOverviewCard
          profile={formData}
          onSaveGoals={(goals) => handleSaveProfileData(goals)}
        />

        {/* 4. Body Measurements */}
        <BodyMeasurements data={formData} onChange={handleChangeField} />

        {/* 5. Health Metrics */}
        <HealthMetrics
          bmi={bmi}
          bmiCategory={bmiCategory}
          tdee={tdee}
          hydration={calculatedHydration}
          bmr={bmr}
          onApplyRecommendation={handleApplyRecommendation}
        />

        {/* 6. Settings Section (Appearance / Theme, Language, Notifications) */}
        <SettingsSection
          profile={formData}
          onUpdateSettings={(settings) => handleSaveProfileData(settings)}
        />

        {/* 7. Gamification & Achievements */}
        <AchievementGrid />

        {/* 8. Nutritionist Report Exporter */}
        <ReportExporter />

        {/* 9. Quick Navigation: Photos & Social */}
        <div className={styles.quickNavGrid}>
          <Button
            variant="secondary"
            fullWidth
            icon={History}
            onClick={() => navigate('/history')}
          >
            Histórico de Fotos
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={Users}
            onClick={() => navigate('/social')}
          >
            Social & Ranking
          </Button>
        </div>

        {/* 10. LGPD Compliance & Data Privacy */}
        <LGPDPrivacyCard user={user} />

        {/* 11. Logout & Footer */}
        <div className={styles.logoutWrap}>
          <Button
            variant="ghost"
            fullWidth
            icon={LogOut}
            onClick={handleLogout}
            style={{ color: 'var(--accent-red)' }}
          >
            Sair da Conta
          </Button>
        </div>

        <p className={styles.footer}>
          FitPulseAI v1.0 • Plataforma em conformidade com a LGPD
        </p>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        profile={formData}
        onSaveProfile={(data) => handleSaveProfileData(data)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProfileErrorBoundary>
      <ProfileContent />
    </ProfileErrorBoundary>
  );
}
