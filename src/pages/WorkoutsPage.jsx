import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Flame, Download, RefreshCw } from 'lucide-react';
import DaySelector from '../components/workouts/DaySelector';
import WorkoutCard from '../components/workouts/WorkoutCard';
import WorkoutForm from '../components/workouts/WorkoutForm';
import WorkoutPreview from '../components/workouts/WorkoutPreview';
import ActiveWorkout from '../components/workouts/ActiveWorkout';
import StravaActivityModal from '../components/workouts/StravaActivityModal';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { useWorkouts } from '../hooks/useWorkouts';
import { useAuth } from '../hooks/useAuth';
import {
  getStravaAuthUrl,
  fetchStravaConnectionStatus,
  exchangeStravaCode,
  fetchStravaActivities,
  disconnectStrava,
} from '../services/stravaService';
import { addMultipleBurnedEntries, fetchBurnedLog } from '../services/burnedService';
import { useToastStore } from '../store/toastStore';
import styles from './WorkoutsPage.module.css';

const DAYS_ORDER = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

function getTodayDayKey() {
  const dayIndex = new Date().getDay(); // 0 = dom, 1 = seg ...
  const map = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  return map[dayIndex];
}

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDay, setSelectedDay] = useState(getTodayDayKey());
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [previewWorkout, setPreviewWorkout] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Strava integration states
  const [stravaConnected, setStravaConnected] = useState(false);
  const [stravaLoading, setStravaLoading] = useState(false);
  const [stravaModalOpen, setStravaModalOpen] = useState(false);
  const [stravaActivities, setStravaActivities] = useState([]);
  const [todayBurned, setTodayBurned] = useState(0);
  const [todayExercises, setTodayExercises] = useState(0);
  const addToast = useToastStore((state) => state.addToast);

  const {
    workouts,
    activeSession,
    loading,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    startSession,
    completeSet,
    tickTimer,
    tickRest,
    addRestTime,
    skipRest,
    togglePause,
    endSession,
    finishAndSaveSession,
  } = useWorkouts();

  // Check Strava Connection & Handle Callback code
  useEffect(() => {
    if (!user) return;

    async function checkStrava() {
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');

      if (code) {
        if (!validateStravaState(stateParam, user.uid)) {
          addToast('Falha de segurança na conexão com Strava. Tente novamente.', 'error');
          searchParams.delete('code');
          searchParams.delete('scope');
          searchParams.delete('state');
          setSearchParams(searchParams);
          return;
        }

        setStravaLoading(true);
        try {
          await exchangeStravaCode(user.uid, code);
          setStravaConnected(true);
          addToast('Strava conectado com sucesso!', 'success');
          searchParams.delete('code');
          searchParams.delete('scope');
          searchParams.delete('state');
          setSearchParams(searchParams);
        } catch (err) {
          console.error('Error exchanging Strava code:', err);
          addToast('Erro ao conectar com Strava.', 'error');
        } finally {
          setStravaLoading(false);
        }
      } else {
        const isConnected = await fetchStravaConnectionStatus(user.uid);
        setStravaConnected(isConnected);
      }
    }

    checkStrava();
  }, [user, searchParams, setSearchParams]);

  // Load today's burned calories
  useEffect(() => {
    if (!user?.uid) return;
    fetchBurnedLog(user.uid, new Date()).then((log) => {
      setTodayBurned(log.totalBurned || 0);
      setTodayExercises(log.entries?.length || 0);
    });
  }, [user?.uid]);

  const filteredWorkouts = workouts.filter(
    (w) => (w.dayOfWeek || 'qua').toLowerCase() === selectedDay
  );

  const handleSaveWorkoutForm = async (workoutData) => {
    setFormLoading(true);
    try {
      if (editingWorkout) {
        await updateWorkout(editingWorkout.id, workoutData);
      } else {
        await addWorkout(workoutData);
      }
      setShowForm(false);
      setEditingWorkout(null);
    } catch (err) {
      console.error('Error saving workout:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleStartWorkout = (workout) => {
    setPreviewWorkout(null);
    startSession(workout);
  };

  const handlePullStrava = async () => {
    if (!stravaConnected) {
      // Redirect to Strava OAuth with state isolation
      window.location.href = getStravaAuthUrl(user.uid);
      return;
    }

    setStravaLoading(true);
    try {
      const activities = await fetchStravaActivities(user.uid);
      if (activities.length > 0) {
        setStravaActivities(activities);
        setStravaModalOpen(true);
      } else {
        addToast('Nenhuma atividade recente encontrada.', 'info');
      }
    } catch (err) {
      console.error('Error fetching Strava activities:', err);
      addToast('Erro ao buscar atividades do Strava.', 'error');
    } finally {
      setStravaLoading(false);
    }
  };

  const handleApplyStravaActivities = async (selectedActivities) => {
    setStravaModalOpen(false);
    try {
      const entries = selectedActivities.map((a) => ({
        source: 'strava',
        calories: a.calories,
        name: a.name,
        activityId: a.id,
        type: a.type,
      }));
      const updatedLog = await addMultipleBurnedEntries(user.uid, new Date(), entries);
      setTodayBurned(updatedLog.totalBurned);
      setTodayExercises(updatedLog.entries.length);

      const totalCals = selectedActivities.reduce((sum, a) => sum + a.calories, 0);
      addToast(
        `+${totalCals} kcal queimadas adicionadas ao seu dia!`,
        'success',
        4000
      );
    } catch (err) {
      console.error('Error applying Strava activities:', err);
      addToast('Erro ao aplicar atividades.', 'error');
    }
  };

  const handleDisconnectStrava = async () => {
    setStravaLoading(true);
    try {
      await disconnectStrava(user.uid);
      setStravaConnected(false);
      addToast('Strava desconectado.', 'info');
    } catch (err) {
      console.error('Error disconnecting Strava:', err);
    } finally {
      setStravaLoading(false);
    }
  };

  const formattedDate = new Date()
    .toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
    .replace(/^\w/, (c) => c.toUpperCase());

  // Render Active Workout Interface if session is running
  if (activeSession) {
    return (
      <div className="page-container">
        <ActiveWorkout
          session={activeSession}
          onCompleteSet={completeSet}
          onTickTimer={tickTimer}
          onTickRest={tickRest}
          onAddRestTime={addRestTime}
          onSkipRest={skipRest}
          onTogglePause={togglePause}
          onCancel={endSession}
          onFinishSession={finishAndSaveSession}
        />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <p className="page-header__date">{formattedDate}</p>
        <h1 className="page-header__title">Treinos</h1>
      </div>

      {/* Burned calories summary card */}
      <div className={styles.burnedCard}>
        <div className={styles.burnedIcon}>
          <Flame size={20} color="var(--accent-orange)" />
        </div>
        <div className={styles.burnedInfo}>
          <span className={styles.burnedValue}>{todayBurned}</span>
          <span className={styles.burnedText}>
            kcal gastas hoje · {todayExercises} {todayExercises === 1 ? 'exercício' : 'exercícios'}
          </span>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className={styles.dayWrap}>
        <DaySelector
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </div>



      {loading ? (
        <div className={styles.loaderWrap}>
          <Loader size={36} />
        </div>
      ) : showForm ? (
        <WorkoutForm
          initialWorkout={editingWorkout}
          dayOfWeek={selectedDay}
          onSave={handleSaveWorkoutForm}
          onCancel={() => {
            setShowForm(false);
            setEditingWorkout(null);
          }}
          loading={formLoading}
        />
      ) : previewWorkout ? (
        <WorkoutPreview
          workout={previewWorkout}
          onStart={handleStartWorkout}
          onCancel={() => setPreviewWorkout(null)}
        />
      ) : (
        <div className={styles.workoutList}>
          {filteredWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onStart={(w) => setPreviewWorkout(w)}
              onEdit={(w) => {
                setEditingWorkout(w);
                setShowForm(true);
              }}
              onDelete={deleteWorkout}
            />
          ))}

          {/* Add Workout Button */}
          <Button
            variant="outline"
            fullWidth
            icon={Plus}
            onClick={() => {
              setEditingWorkout(null);
              setShowForm(true);
            }}
          >
            Adicionar outro treino
          </Button>

          {/* Strava Section */}
          <div className={styles.stravaSection}>
            <Button
              variant="orange"
              fullWidth
              size="lg"
              icon={Download}
              loading={stravaLoading}
              onClick={handlePullStrava}
            >
              Puxar atividade do Strava
            </Button>

            {stravaConnected && (
              <Button
                variant="secondary"
                fullWidth
                icon={RefreshCw}
                loading={stravaLoading}
                onClick={handleDisconnectStrava}
              >
                Desconectar Strava
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Strava Activity Selector Modal */}
      <StravaActivityModal
        isOpen={stravaModalOpen}
        activities={stravaActivities}
        loading={stravaLoading}
        onApply={handleApplyStravaActivities}
        onClose={() => setStravaModalOpen(false)}
      />
    </div>
  );
}
