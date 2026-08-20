import { useState } from 'react';
import { Target, Edit3, Flame, Droplets, Dumbbell, Sparkles, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { calculateComprehensiveGoals } from '../../services/profileService';
import styles from './GoalsOverviewCard.module.css';

export default function GoalsOverviewCard({ profile, onSaveGoals }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'

  const [editState, setEditState] = useState({
    goal: profile?.goal || 'perda_peso',
    targetWeight: profile?.targetWeight || profile?.weight || 75,
    workoutDaysPerWeek: profile?.workoutDaysPerWeek || 4,
    calorieGoal: profile?.calorieGoal || 2200,
    proteinGoal: profile?.proteinGoal || 150,
    carbsGoal: profile?.carbsGoal || 220,
    fatGoal: profile?.fatGoal || 60,
    hydrationGoal: profile?.hydrationGoal || 2600,
  });

  const handleOpenModal = () => {
    setEditState({
      goal: profile?.goal || 'perda_peso',
      targetWeight: profile?.targetWeight || profile?.weight || 75,
      workoutDaysPerWeek: profile?.workoutDaysPerWeek || 4,
      calorieGoal: profile?.calorieGoal || 2200,
      proteinGoal: profile?.proteinGoal || 150,
      carbsGoal: profile?.carbsGoal || 220,
      fatGoal: profile?.fatGoal || 60,
      hydrationGoal: profile?.hydrationGoal || 2600,
    });
    setModalOpen(true);
  };

  const handleGoalOrParamChange = (field, val) => {
    const next = { ...editState, [field]: val };
    if (mode === 'auto') {
      const calculated = calculateComprehensiveGoals({
        weight: profile?.weight || 75,
        height: profile?.height || 175,
        age: profile?.age || 25,
        sex: profile?.sex || 'masculino',
        activityLevel: profile?.activityLevel || 'moderado',
        goal: next.goal,
        workoutDaysPerWeek: next.workoutDaysPerWeek,
        targetWeight: next.targetWeight,
      });
      next.calorieGoal = calculated.calorieGoal;
      next.proteinGoal = calculated.proteinGoal;
      next.carbsGoal = calculated.carbsGoal;
      next.fatGoal = calculated.fatGoal;
      next.hydrationGoal = calculated.hydrationGoal;
    }
    setEditState(next);
  };

  const handleSave = async () => {
    await onSaveGoals(editState);
    setModalOpen(false);
  };

  const calorieGoal = profile?.calorieGoal || 2200;
  const proteinGoal = profile?.proteinGoal || 150;
  const carbsGoal = profile?.carbsGoal || 220;
  const fatGoal = profile?.fatGoal || 60;
  const hydrationGoal = profile?.hydrationGoal || 2600;

  return (
    <>
      <Card variant="bordered" padding="lg" className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.iconWrap}>
              <Target size={20} color="var(--accent-green)" />
            </div>
            <div>
              <h3 className={styles.title}>Minhas Metas</h3>
              <p className={styles.subtitle}>Nutrição, macros e hidratação diária</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={Edit3}
            onClick={handleOpenModal}
          >
            Editar Metas
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className={styles.statsGrid}>
          {/* Calories */}
          <div className={styles.calorieItem}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(255, 109, 0, 0.12)' }}>
              <Flame size={20} color="var(--accent-orange)" />
            </div>
            <div>
              <span className={styles.statLabel}>Calorias</span>
              <div className={styles.statVal}>
                {calorieGoal.toLocaleString('pt-BR')} <span className={styles.statUnit}>kcal</span>
              </div>
            </div>
          </div>

          {/* Hydration */}
          <div className={styles.calorieItem}>
            <div className={styles.statIconWrap} style={{ background: 'rgba(56, 189, 248, 0.12)' }}>
              <Droplets size={20} color="#38BDF8" />
            </div>
            <div>
              <span className={styles.statLabel}>Água</span>
              <div className={styles.statVal}>
                {hydrationGoal.toLocaleString('pt-BR')} <span className={styles.statUnit}>ml</span>
              </div>
            </div>
          </div>
        </div>

        {/* Macros Distribution */}
        <div className={styles.macrosWrap}>
          <div className={styles.macroPill} style={{ borderColor: 'rgba(239, 83, 80, 0.3)' }}>
            <span className={styles.macroDot} style={{ background: '#EF5350' }} />
            <span className={styles.macroName}>Proteína</span>
            <span className={styles.macroGrams}>{proteinGoal}g</span>
          </div>

          <div className={styles.macroPill} style={{ borderColor: 'rgba(56, 189, 248, 0.3)' }}>
            <span className={styles.macroDot} style={{ background: '#38BDF8' }} />
            <span className={styles.macroName}>Carboidratos</span>
            <span className={styles.macroGrams}>{carbsGoal}g</span>
          </div>

          <div className={styles.macroPill} style={{ borderColor: 'rgba(255, 214, 0, 0.3)' }}>
            <span className={styles.macroDot} style={{ background: '#FFD600' }} />
            <span className={styles.macroName}>Gorduras</span>
            <span className={styles.macroGrams}>{fatGoal}g</span>
          </div>
        </div>
      </Card>

      {/* Edit Goals Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar Metas Nutricionais"
      >
        <div className={styles.modalBody}>
          {/* Mode Switcher */}
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'auto' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('auto')}
            >
              <Sparkles size={14} /> Recálculo Inteligente
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'manual' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('manual')}
            >
              <Edit3 size={14} /> Ajuste Manual
            </button>
          </div>

          {mode === 'auto' ? (
            <div className={styles.autoSection}>
              {/* Goal Select */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Objetivo Metabólico</label>
                <select
                  className={styles.selectInput}
                  value={editState.goal}
                  onChange={(e) => handleGoalOrParamChange('goal', e.target.value)}
                >
                  <option value="perda_peso">🔥 Emagrecimento (Déficit -400 kcal)</option>
                  <option value="manutencao">⚖️ Manutenção (GET Neutro)</option>
                  <option value="ganho_massa">💪 Hipertrofia (Superávit +400 kcal)</option>
                </select>
              </div>

              {/* Workout frequency */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Frequência de Treinos Semanal</label>
                <div className={styles.daysRow}>
                  {[2, 3, 4, 5, 6].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`${styles.dayPill} ${
                        editState.workoutDaysPerWeek === d ? styles.dayPillActive : ''
                      }`}
                      onClick={() => handleGoalOrParamChange('workoutDaysPerWeek', d)}
                    >
                      {d}x / sem
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Weight */}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Peso Alvo (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  className={styles.textInput}
                  value={editState.targetWeight}
                  onChange={(e) => handleGoalOrParamChange('targetWeight', Number(e.target.value))}
                />
              </div>

              {/* Preview Box */}
              <div className={styles.previewBox}>
                <span className={styles.previewTitle}>Resultado Calculado:</span>
                <div className={styles.previewGrid}>
                  <div><strong>{editState.calorieGoal}</strong> kcal</div>
                  <div><strong>{editState.proteinGoal}g</strong> Proteína</div>
                  <div><strong>{editState.carbsGoal}g</strong> Carbo</div>
                  <div><strong>{editState.fatGoal}g</strong> Gordura</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.manualSection}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Calorias Diárias (kcal)</label>
                <input
                  type="number"
                  className={styles.textInput}
                  value={editState.calorieGoal}
                  onChange={(e) =>
                    setEditState({ ...editState, calorieGoal: Number(e.target.value) })
                  }
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Proteína (g)</label>
                  <input
                    type="number"
                    className={styles.textInput}
                    value={editState.proteinGoal}
                    onChange={(e) =>
                      setEditState({ ...editState, proteinGoal: Number(e.target.value) })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Carboidratos (g)</label>
                  <input
                    type="number"
                    className={styles.textInput}
                    value={editState.carbsGoal}
                    onChange={(e) =>
                      setEditState({ ...editState, carbsGoal: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Gorduras (g)</label>
                  <input
                    type="number"
                    className={styles.textInput}
                    value={editState.fatGoal}
                    onChange={(e) =>
                      setEditState({ ...editState, fatGoal: Number(e.target.value) })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Água (ml)</label>
                  <input
                    type="number"
                    step="50"
                    className={styles.textInput}
                    value={editState.hydrationGoal}
                    onChange={(e) =>
                      setEditState({ ...editState, hydrationGoal: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="ghost" fullWidth onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" icon={Check} fullWidth onClick={handleSave}>
              Salvar Metas
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
