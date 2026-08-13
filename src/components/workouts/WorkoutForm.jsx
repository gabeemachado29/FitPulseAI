import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ExerciseSearch from './ExerciseSearch';
import styles from './WorkoutForm.module.css';

const DAY_LABELS = {
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  sab: 'Sábado',
  dom: 'Domingo',
};

export default function WorkoutForm({
  initialWorkout = null,
  dayOfWeek = 'qua',
  onSave,
  onCancel,
  loading = false,
}) {
  const [name, setName] = useState(initialWorkout?.name || '');
  const [exercises, setExercises] = useState(
    initialWorkout?.exercises || []
  );
  const [showSearch, setShowSearch] = useState(false);

  const handleAddExerciseFromBase = (baseExercise) => {
    setExercises([
      ...exercises,
      {
        name: baseExercise.name,
        muscleGroup: baseExercise.muscleGroup,
        sets: baseExercise.defaultSets || 4,
        reps: baseExercise.defaultReps || 10,
        load: 0,
      },
    ]);
    setShowSearch(false);
  };

  const handleUpdateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index] = {
      ...updated[index],
      [field]: field === 'name' ? value : Number(value) || 0,
    };
    setExercises(updated);
  };

  const handleRemoveExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || exercises.length === 0) return;

    onSave({
      name: name.trim(),
      dayOfWeek,
      exercises,
    });
  };

  const dayName = DAY_LABELS[dayOfWeek] || 'Quarta';

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {initialWorkout ? 'Editar treino' : `Novo treino · ${dayName.slice(0, 3)}`}
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onCancel}>
          <X size={20} />
        </button>
      </div>

      <Input
        label="Nome do treino"
        placeholder="ex: Treino A - Peito"
        value={name}
        onChange={setName}
        required
      />

      {/* Added Exercises List */}
      <div className={styles.exercisesList}>
        {exercises.map((ex, idx) => (
          <div key={idx} className={styles.exerciseCard}>
            <div className={styles.exHeader}>
              <span className={styles.exName}>{ex.name}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemoveExercise(idx)}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className={styles.exInputsRow}>
              <div className={styles.miniField}>
                <label>Séries</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={ex.sets}
                  onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                />
              </div>

              <div className={styles.miniField}>
                <label>Reps</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={ex.reps}
                  onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                />
              </div>

              <div className={styles.miniField}>
                <label>Carga (kg)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={ex.load}
                  onChange={(e) => handleUpdateExercise(idx, 'load', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search trigger or inline search */}
      {showSearch ? (
        <ExerciseSearch
          onSelectExercise={handleAddExerciseFromBase}
          onClose={() => setShowSearch(false)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          fullWidth
          icon={Plus}
          onClick={() => setShowSearch(true)}
        >
          Adicionar exercício da base
        </Button>
      )}

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={!name.trim() || exercises.length === 0}
        >
          Salvar treino
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
