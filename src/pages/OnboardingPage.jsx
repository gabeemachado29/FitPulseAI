import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Activity,
  Target,
  Flame,
  Droplets,
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Scale,
  Zap,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useToastStore } from '../store/toastStore';
import { calculateComprehensiveGoals } from '../services/profileService';
import styles from './OnboardingPage.module.css';

const ACTIVITY_LEVELS = [
  {
    id: 'sedentario',
    title: 'Sedentário',
    desc: 'Pouco ou nenhum exercício no dia a dia',
    icon: '🛋️',
    multiplier: '1.2x',
  },
  {
    id: 'leve',
    title: 'Levemente Ativo',
    desc: 'Exercícios leves 1 a 3 dias por semana',
    icon: '🚶',
    multiplier: '1.375x',
  },
  {
    id: 'moderado',
    title: 'Moderadamente Ativo',
    desc: 'Treinos moderados 3 a 5 dias por semana',
    icon: '🏃',
    multiplier: '1.55x',
  },
  {
    id: 'ativo',
    title: 'Altamente Ativo',
    desc: 'Treinos intensos 6 a 7 dias por semana',
    icon: '⚡',
    multiplier: '1.725x',
  },
];

const GOALS = [
  {
    id: 'perda_peso',
    title: 'Emagrecimento',
    badge: 'Déficit Calórico',
    desc: 'Queima de gordura preservando o máximo de massa magra.',
    icon: '🔥',
    color: '#FF6D00',
  },
  {
    id: 'manutencao',
    title: 'Manutenção de Peso',
    badge: 'Balanço Neutro',
    desc: 'Melhora de composição corporal, saúde e rendimento.',
    icon: '⚖️',
    color: '#00E676',
  },
  {
    id: 'ganho_massa',
    title: 'Hipertrofia Muscular',
    badge: 'Superávit Calórico',
    desc: 'Construção de volume e ganho de força muscular.',
    icon: '💪',
    color: '#38BDF8',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const addToast = useToastStore((state) => state.addToast);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sex: profile?.sex || 'masculino',
    age: profile?.age || 25,
    height: profile?.height || 175,
    weight: profile?.weight || 75,
    activityLevel: profile?.activityLevel || 'moderado',
    workoutDaysPerWeek: profile?.workoutDaysPerWeek || 4,
    goal: profile?.goal || 'perda_peso',
    targetWeight: profile?.targetWeight || profile?.weight || 70,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Real-time calculated goals using Mifflin-St Jeor
  const calculated = useMemo(() => {
    return calculateComprehensiveGoals({
      weight: formData.weight,
      height: formData.height,
      age: formData.age,
      sex: formData.sex,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      workoutDaysPerWeek: formData.workoutDaysPerWeek,
      targetWeight: formData.targetWeight,
    });
  }, [formData]);

  const handleNextStep = () => {
    if (step === 1) {
      if (formData.weight < 30 || formData.weight > 300) {
        addToast('Insira um peso válido (entre 30kg e 300kg).', 'error');
        return;
      }
      if (formData.height < 100 || formData.height > 250) {
        addToast('Insira uma altura válida (entre 100cm e 250cm).', 'error');
        return;
      }
      if (formData.age < 12 || formData.age > 100) {
        addToast('Insira uma idade válida (entre 12 e 100 anos).', 'error');
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinishOnboarding = async () => {
    setSaving(true);
    try {
      const finalProfileData = {
        ...formData,
        ...calculated,
        has_completed_onboarding: true,
      };

      await updateProfile(finalProfileData);
      addToast('🎉 Plano nutricional e metabólico criado com sucesso!', 'success');
      navigate('/');
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err);
      addToast('Erro ao salvar dados de onboarding. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const userName = user?.displayName?.split(' ')[0] || 'Atleta';

  return (
    <div className={styles.container}>
      {/* Background ambient glow */}
      <div className={styles.ambientGlow} />

      <div className={styles.wrapper}>
        {/* Header Progress Bar */}
        <header className={styles.header}>
          <div className={styles.logoRow}>
            <div className={styles.logoBadge}>
              <Sparkles size={20} color="var(--accent-green)" />
            </div>
            <div>
              <span className={styles.brandTitle}>FitPulse AI</span>
              <span className={styles.brandSubtitle}>Personalização Metabólica</span>
            </div>
          </div>

          <div className={styles.progressTracker}>
            <div className={styles.stepLabels}>
              <span>Etapa {step} de 4</span>
              <span className={styles.stepName}>
                {step === 1 && 'Dados Pessoais'}
                {step === 2 && 'Rotina & Atividade'}
                {step === 3 && 'Objetivo Principal'}
                {step === 4 && 'Suas Metas'}
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* Step 1: Personal Data */}
        {step === 1 && (
          <div className={`${styles.stepContent} animate-fade-in`}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIconWrap}>
                <User size={24} color="var(--accent-green)" />
              </div>
              <div>
                <h2 className={styles.stepTitle}>Bem-vindo, {userName}! 👋</h2>
                <p className={styles.stepDesc}>
                  Vamos calcular seu metabolismo basal exato (Mifflin-St Jeor).
                </p>
              </div>
            </div>

            {/* Sex Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Sexo Biológico</label>
              <div className={styles.genderGrid}>
                <button
                  type="button"
                  className={`${styles.genderBtn} ${
                    formData.sex === 'masculino' ? styles.genderBtnActive : ''
                  }`}
                  onClick={() => handleChange('sex', 'masculino')}
                >
                  <span className={styles.genderIcon}>👨</span>
                  <span>Masculino</span>
                </button>
                <button
                  type="button"
                  className={`${styles.genderBtn} ${
                    formData.sex === 'feminino' ? styles.genderBtnActive : ''
                  }`}
                  onClick={() => handleChange('sex', 'feminino')}
                >
                  <span className={styles.genderIcon}>👩</span>
                  <span>Feminino</span>
                </button>
              </div>
            </div>

            {/* Age, Height, Weight Grid */}
            <div className={styles.inputsGrid}>
              <div className={styles.inputCard}>
                <label className={styles.label}>Idade</label>
                <div className={styles.numberInputWrap}>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    className={styles.numberInput}
                    value={formData.age}
                    onChange={(e) => handleChange('age', Number(e.target.value))}
                  />
                  <span className={styles.unit}>anos</span>
                </div>
              </div>

              <div className={styles.inputCard}>
                <label className={styles.label}>Altura</label>
                <div className={styles.numberInputWrap}>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    className={styles.numberInput}
                    value={formData.height}
                    onChange={(e) => handleChange('height', Number(e.target.value))}
                  />
                  <span className={styles.unit}>cm</span>
                </div>
              </div>

              <div className={styles.inputCard}>
                <label className={styles.label}>Peso Atual</label>
                <div className={styles.numberInputWrap}>
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="300"
                    className={styles.numberInput}
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                  />
                  <span className={styles.unit}>kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Routine & Activity Level */}
        {step === 2 && (
          <div className={`${styles.stepContent} animate-fade-in`}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIconWrap}>
                <Activity size={24} color="var(--accent-green)" />
              </div>
              <div>
                <h2 className={styles.stepTitle}>Qual é o seu nível de atividade?</h2>
                <p className={styles.stepDesc}>
                  Calcula o Gasto Energético Total (GET) ao longo do dia.
                </p>
              </div>
            </div>

            <div className={styles.optionsList}>
              {ACTIVITY_LEVELS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.optionCard} ${
                    formData.activityLevel === item.id ? styles.optionCardActive : ''
                  }`}
                  onClick={() => handleChange('activityLevel', item.id)}
                >
                  <div className={styles.optionEmoji}>{item.icon}</div>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionTitleRow}>
                      <span className={styles.optionTitle}>{item.title}</span>
                      <span className={styles.optionBadge}>{item.multiplier}</span>
                    </div>
                    <p className={styles.optionDesc}>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Weekly Workout Days */}
            <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
              <div className={styles.workoutHeader}>
                <label className={styles.label}>
                  <Dumbbell size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Frequência de treinos desejada
                </label>
                <span className={styles.workoutCount}>
                  {formData.workoutDaysPerWeek}x por semana
                </span>
              </div>
              <div className={styles.daysSelector}>
                {[2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`${styles.dayBtn} ${
                      formData.workoutDaysPerWeek === num ? styles.dayBtnActive : ''
                    }`}
                    onClick={() => handleChange('workoutDaysPerWeek', num)}
                  >
                    {num} dias
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goal & Target Weight */}
        {step === 3 && (
          <div className={`${styles.stepContent} animate-fade-in`}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIconWrap}>
                <Target size={24} color="var(--accent-green)" />
              </div>
              <div>
                <h2 className={styles.stepTitle}>Qual o seu objetivo principal?</h2>
                <p className={styles.stepDesc}>
                  Definirá a divisão de calorias, déficit ou superávit e macros.
                </p>
              </div>
            </div>

            <div className={styles.optionsList}>
              {GOALS.map((goalItem) => (
                <button
                  key={goalItem.id}
                  type="button"
                  className={`${styles.optionCard} ${
                    formData.goal === goalItem.id ? styles.optionCardActive : ''
                  }`}
                  onClick={() => handleChange('goal', goalItem.id)}
                >
                  <div className={styles.optionEmoji}>{goalItem.icon}</div>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionTitleRow}>
                      <span className={styles.optionTitle}>{goalItem.title}</span>
                      <span
                        className={styles.optionBadge}
                        style={{
                          backgroundColor: `${goalItem.color}20`,
                          color: goalItem.color,
                        }}
                      >
                        {goalItem.badge}
                      </span>
                    </div>
                    <p className={styles.optionDesc}>{goalItem.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Target Weight */}
            <div className={styles.formGroup} style={{ marginTop: '1.25rem' }}>
              <div className={styles.inputCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className={styles.label}>
                    <Scale size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Peso Alvo (Meta)
                  </label>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Atual: {formData.weight}kg
                  </span>
                </div>
                <div className={styles.numberInputWrap}>
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    max="300"
                    className={styles.numberInput}
                    value={formData.targetWeight}
                    onChange={(e) => handleChange('targetWeight', Number(e.target.value))}
                  />
                  <span className={styles.unit}>kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Metabolic Goals Summary & Launch */}
        {step === 4 && (
          <div className={`${styles.stepContent} animate-fade-in`}>
            <div className={styles.stepHeader}>
              <div className={styles.stepIconWrap} style={{ background: 'rgba(0, 230, 118, 0.2)' }}>
                <CheckCircle2 size={26} color="var(--accent-green)" />
              </div>
              <div>
                <h2 className={styles.stepTitle}>Seu Plano Inteligente está Pronto! 🎯</h2>
                <p className={styles.stepDesc}>
                  Calculado matematicamente com base no seu perfil corporal e rotina.
                </p>
              </div>
            </div>

            {/* Key Calorie Card */}
            <div className={styles.summaryHighlightCard}>
              <div className={styles.highlightLeft}>
                <span className={styles.highlightLabel}>Meta Calórica Diária</span>
                <div className={styles.highlightValRow}>
                  <span className={styles.highlightBigVal}>
                    {calculated.calorieGoal.toLocaleString('pt-BR')}
                  </span>
                  <span className={styles.highlightUnit}>kcal / dia</span>
                </div>
                <span className={styles.highlightSub}>
                  TMB: {calculated.bmr} kcal • GET: {calculated.tdee} kcal
                </span>
              </div>
              <div className={styles.highlightIcon}>
                <Flame size={36} color="var(--accent-orange)" />
              </div>
            </div>

            {/* Macros Distribution Grid */}
            <div className={styles.macrosGrid}>
              <div className={styles.macroCard} style={{ borderTop: '3px solid #EF5350' }}>
                <span className={styles.macroTitle}>Proteínas</span>
                <span className={styles.macroGrams}>{calculated.proteinGoal}g</span>
                <span className={styles.macroCalories}>
                  {calculated.proteinGoal * 4} kcal
                </span>
              </div>

              <div className={styles.macroCard} style={{ borderTop: '3px solid #38BDF8' }}>
                <span className={styles.macroTitle}>Carboidratos</span>
                <span className={styles.macroGrams}>{calculated.carbsGoal}g</span>
                <span className={styles.macroCalories}>
                  {calculated.carbsGoal * 4} kcal
                </span>
              </div>

              <div className={styles.macroCard} style={{ borderTop: '3px solid #FFD600' }}>
                <span className={styles.macroTitle}>Gorduras</span>
                <span className={styles.macroGrams}>{calculated.fatGoal}g</span>
                <span className={styles.macroCalories}>
                  {calculated.fatGoal * 9} kcal
                </span>
              </div>
            </div>

            {/* Hydration Card */}
            <div className={styles.waterCard}>
              <div className={styles.waterLeft}>
                <Droplets size={24} color="#38BDF8" />
                <div>
                  <span className={styles.waterTitle}>Meta Diária de Água</span>
                  <span className={styles.waterDesc}>
                    35ml/kg {formData.workoutDaysPerWeek >= 3 ? '+ 500ml (dias de treino)' : ''}
                  </span>
                </div>
              </div>
              <div className={styles.waterRight}>
                <span className={styles.waterVal}>
                  {calculated.hydrationGoal.toLocaleString('pt-BR')}
                </span>
                <span className={styles.waterUnit}>ml</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <footer className={styles.footer}>
          {step > 1 ? (
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={handlePrevStep}
              disabled={saving}
            >
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={handleNextStep}
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Zap}
              size="lg"
              loading={saving}
              onClick={handleFinishOnboarding}
              style={{ minWidth: '220px' }}
            >
              Começar Jornada FitPulse 🚀
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
