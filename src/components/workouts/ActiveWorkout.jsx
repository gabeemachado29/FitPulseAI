import { useEffect, useState } from 'react';
import { X, Pause, Play, Plus, Minus, Check, Flame, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import RestTimer from './RestTimer';
import styles from './ActiveWorkout.module.css';

export default function ActiveWorkout({
  session,
  onCompleteSet,
  onTickTimer,
  onTickRest,
  onAddRestTime,
  onSkipRest,
  onTogglePause,
  onCancel,
  onFinishSession,
}) {
  const [load, setLoad] = useState(0);
  const [setTimer, setSetTimer] = useState(0);

  // Interval for active workout timer
  useEffect(() => {
    const interval = setInterval(() => {
      onTickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [onTickTimer]);

  // Timer for current set duration
  useEffect(() => {
    if (session?.isResting || session?.isPaused) return;

    const setInt = setInterval(() => {
      setSetTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(setInt);
  }, [session?.isResting, session?.isPaused]);

  if (!session) return null;

  const {
    workoutName,
    exercises = [],
    currentExerciseIndex = 0,
    currentSetIndex = 0,
    totalSets = 1,
    completedSetsCount = 0,
    elapsedSeconds = 0,
    caloriesBurned = 0,
    isResting = false,
    restSecondsRemaining = 60,
    isPaused = false,
  } = session;

  const currentExercise = exercises[currentExerciseIndex] || exercises[0];
  const progressPercent = Math.round((completedSetsCount / totalSets) * 100);

  const formatElapsed = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinishSetClick = () => {
    const isWorkoutDone = onCompleteSet(load);
    setSetTimer(0);
    if (isWorkoutDone) {
      onFinishSession();
    }
  };

  const nextExercise =
    currentSetIndex + 1 >= (currentExercise?.sets || 0)
      ? exercises[currentExerciseIndex + 1]
      : currentExercise;

  return (
    <div className={styles.container}>
      {/* Session Top Bar */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onCancel}
          aria-label="Cancelar treino"
        >
          <X size={20} />
        </button>

        <div className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <Clock size={16} />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
          <div className={styles.metricItemOrange}>
            <Flame size={16} />
            <span>{caloriesBurned} kcal</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.pauseBtn}
          onClick={onTogglePause}
          aria-label={isPaused ? 'Continuar treino' : 'Pausar treino'}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>

      {/* Overall Progress Bar */}
      <div className={styles.progressSection}>
        <ProgressBar
          value={completedSetsCount}
          max={totalSets}
          showLabel
          label={`Série ${completedSetsCount + 1} de ${totalSets}`}
          height={6}
        />
      </div>

      {/* Main Content — Rest Timer or Active Exercise */}
      {isResting ? (
        <RestTimer
          restSeconds={restSecondsRemaining}
          completedExerciseName={currentExercise?.name}
          completedSetNumber={completedSetsCount}
          nextExerciseName={nextExercise?.name}
          onTick={onTickRest}
          onAdd15s={onAddRestTime}
          onSkip={onSkipRest}
        />
      ) : (
        <Card variant="default" padding="lg" className={styles.exerciseCard}>
          <div className={styles.badgeRow}>
            <Badge variant="green">{currentExercise?.muscleGroup || 'GERAL'}</Badge>
          </div>

          <h2 className={styles.exerciseTitle}>{currentExercise?.name}</h2>
          <p className={styles.exerciseSubtitle}>
            Série {currentSetIndex + 1} de {currentExercise?.sets}
          </p>

          {/* Stats Cards */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{currentExercise?.reps}</span>
              <span className={styles.statLabel}>Repetições</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNum}>
                {currentSetIndex + 1}/{currentExercise?.sets}
              </span>
              <span className={styles.statLabel}>Série</span>
            </div>
          </div>

          {/* Load Adjuster */}
          <div className={styles.loadSection}>
            <span className={styles.loadLabel}>Carga (ajuste para esta série)</span>
            <div className={styles.loadControl}>
              <button
                type="button"
                className={styles.loadBtn}
                onClick={() => setLoad(Math.max(0, load - 2.5))}
              >
                <Minus size={20} />
              </button>
              <div className={styles.loadValueWrap}>
                <span className={styles.loadValue}>{load}</span>
                <span className={styles.loadUnit}>kg</span>
              </div>
              <button
                type="button"
                className={styles.loadBtn}
                onClick={() => setLoad(load + 2.5)}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Set Duration Timer */}
          <div className={styles.setTimerDisplay}>
            <span className={styles.setTimerVal}>{formatElapsed(setTimer)}</span>
            <span className={styles.setTimerLabel}>tempo nesta série</span>
          </div>

          {/* Complete Set Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            icon={Check}
            onClick={handleFinishSetClick}
            className={styles.completeBtn}
          >
            Concluir série
          </Button>
        </Card>
      )}
    </div>
  );
}
