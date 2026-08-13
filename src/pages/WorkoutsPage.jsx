import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Flame, Download, RefreshCw } from 'lucide-react';
import DaySelector from '../components/workouts/DaySelector';
import WorkoutCard from '../components/workouts/WorkoutCard';
import WorkoutForm from '../components/workouts/WorkoutForm';
import WorkoutPreview from '../components/workouts/WorkoutPreview';
import ActiveWorkout from '../components/workouts/ActiveWorkout';
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
  const [stravaNotice, setStravaNotice] = useState('');

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
      if (code) {
        setStravaLoading(true);
        try {
          await exchangeStravaCode(user.uid, code);
          setStravaConnected(true);
          setStravaNotice('✓ Strava conectado com sucesso!');
          searchParams.delete('code');
          searchParams.delete('scope');
          searchParams.delete('state');
          setSearchParams(searchParams);
        } catch (err) {
          console.error('Error exchanging Strava code:', err);
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
        setStravaNotice(
          `✓ Puxadas ${activities.length} atividades do Strava!`
        );
      }
    } catch (err) {
      console.error('Error fetching Strava activities:', err);
    } finally {
      setStravaLoading(false);
    }
  };

  const handleDisconnectStrava = async () => {
    setStravaLoading(true);
    try {
      await disconnectStrava(user.uid);
      setStravaConnected(false);
      setStravaNotice('Strava desconectado.');
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
          <span className={styles.burnedValue}>0</span>
          <span className={styles.burnedText}>
            kcal gastas hoje · 0 exercícios
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

      {stravaNotice && (
        <div className={styles.noticeBanner}>{stravaNotice}</div>
      )}

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
    </div>
  );
}
