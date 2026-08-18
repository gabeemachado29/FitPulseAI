import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import UserInfo from '../components/profile/UserInfo';
import BodyMeasurements from '../components/profile/BodyMeasurements';
import HealthMetrics from '../components/profile/HealthMetrics';
import DailyGoals from '../components/profile/DailyGoals';
import MacroGoals from '../components/profile/MacroGoals';
import ReportExporter from '../components/profile/ReportExporter';
import AchievementGrid from '../components/achievements/AchievementGrid';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useToastStore } from '../store/toastStore';
import { auth } from '../config/firebase';
import { deleteUserAccount } from '../services/accountService';
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
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Erro na exibição do perfil</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Ocorreu um erro imprevisto ao carregar este componente.'}
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
  // Safe navigation fallback to prevent 'useNavigate is not a function' errors
  let navigate;
  try {
    const rawNavigate = useNavigate();
    navigate = (path) => {
      if (typeof rawNavigate === 'function') {
        rawNavigate(path);
      } else {
        window.location.href = path;
      }
    };
  } catch (e) {
    navigate = (path) => {
      window.location.href = path;
    };
  }

  const { user, logout } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    height: 175,
    weight: 75,
    age: 25,
    sex: 'masculino',
    activityLevel: 'sedentario',
    calorieGoal: 2200,
    hydrationGoal: 2625,
    proteinGoal: 150,
    carbsGoal: 220,
    fatGoal: 60,
  });

  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const addToast = useToastStore((state) => state.addToast);

  // Sync profile data safely when loaded from Firestore
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

  // Recalculate health metrics dynamically with safe fallbacks
  const safeWeight = Number(formData.weight) || 75;
  const safeHeight = Number(formData.height) || 175;
  const safeAge = Number(formData.age) || 25;
  const safeSex = formData.sex || 'masculino';
  const safeActivity = formData.activityLevel || 'sedentario';

  const { bmi, category: bmiCategory } = calculateBMI(safeWeight, safeHeight);
  const bmr = calculateBMR(safeWeight, safeHeight, safeAge, safeSex);
  const tdee = calculateTDEE(bmr, safeActivity);
  const calculatedHydration = calculateHydrationGoal(safeWeight);
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
      addToast('Perfil salvo com sucesso!', 'success');
    } catch (err) {
      console.error('Error saving profile:', err);
      addToast('Erro ao salvar perfil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR') {
      setDeleteError('Digite EXCLUIR para confirmar.');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não encontrado');

      await deleteUserAccount(currentUser);
      addToast('Conta e dados excluídos com sucesso.', 'info');
      setDeleteModalOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      if (err.message === 'REQUIRES_REAUTH') {
        setDeleteError('Por razões de segurança, faça logout e login novamente para excluir a conta.');
      } else {
        setDeleteError(err.message || 'Erro ao excluir conta.');
      }
    } finally {
      setDeleting(false);
    }
  };

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

        {/* Gamification & Badges Section */}
        <AchievementGrid />

        {/* Report Exporter Card for Nutritionist */}
        <ReportExporter />

        {/* Quick Navigation: Photo History & Social */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/history')}
          >
            📸 Histórico de Fotos
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/social')}
          >
            👥 Social & Ranking
          </Button>
        </div>

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
            onClick={() => {
              setDeleteConfirmText('');
              setDeleteError('');
              setDeleteModalOpen(true);
            }}
          >
            Excluir Conta
          </Button>
        </div>

        {/* Legal & Privacy links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0 0.5rem 0' }}>
          <Link to="/terms" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
            Termos de Uso
          </Link>
          <span style={{ color: 'var(--border-secondary)' }}>•</span>
          <Link to="/privacy" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textDecoration: 'none' }}>
            Política de Privacidade
          </Link>
        </div>

        {/* Updated Footer branding for production */}
        <p className={styles.footer}>FitPulseAI v1.0 • Todos os direitos reservados</p>
      </div>

      {/* Real Account Deletion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir Conta Permanentemente"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'rgba(239, 83, 80, 0.1)', border: '1px solid rgba(239, 83, 80, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
              <strong>Atenção LGPD:</strong> Esta ação excluirá todos os seus treinos, refeições, histórico e dados pessoais de forma <strong>irreversível</strong>.
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Para confirmar a exclusão permanente da sua conta, digite <strong>EXCLUIR</strong> no campo abaixo:
          </p>

          <Input
            value={deleteConfirmText}
            onChange={(val) => {
              setDeleteConfirmText(val);
              setDeleteError('');
            }}
            placeholder="Digite EXCLUIR"
          />

          {deleteError && (
            <p style={{ color: 'var(--accent-red)', fontSize: '0.8125rem', margin: 0 }}>
              {deleteError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={deleting}
              disabled={deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR'}
              onClick={handleConfirmDeleteAccount}
            >
              Sim, Excluir Tudo
            </Button>
          </div>
        </div>
      </Modal>
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
