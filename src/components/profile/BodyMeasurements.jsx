import { HeartPulse } from 'lucide-react';
import Input from '../ui/Input';
import PillToggle from '../ui/PillToggle';
import styles from './BodyMeasurements.module.css';

const SEX_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentario', label: 'Sedentário' },
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'muito_ativo', label: 'Muito ativo' },
];

export default function BodyMeasurements({ data = {}, onChange }) {
  const safeHeight = data?.height ?? 175;
  const safeWeight = data?.weight ?? 75;
  const safeAge = data?.age ?? 25;
  const safeSex = data?.sex || 'masculino';
  const safeActivity = data?.activityLevel || 'sedentario';

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <HeartPulse size={18} color="var(--accent-green)" />
        <h3 className={styles.title}>Medidas corporais</h3>
      </div>

      <div className={styles.grid2}>
        <Input
          id="height-input"
          label="Altura (cm)"
          type="number"
          value={safeHeight}
          onChange={(val) => onChange && onChange('height', Number(val) || 0)}
          placeholder="175"
        />
        <Input
          id="weight-input"
          label="Peso (kg)"
          type="number"
          value={safeWeight}
          onChange={(val) => onChange && onChange('weight', Number(val) || 0)}
          placeholder="75"
        />
      </div>

      <div className={styles.grid2}>
        <Input
          id="age-input"
          label="Idade"
          type="number"
          value={safeAge}
          onChange={(val) => onChange && onChange('age', Number(val) || 0)}
          placeholder="25"
        />

        <div className={styles.sexSection}>
          <label className={styles.sexLabel}>Sexo biológico</label>
          <PillToggle
            options={SEX_OPTIONS}
            value={safeSex}
            onChange={(val) => onChange && onChange('sex', val)}
            fullWidth
          />
        </div>
      </div>

      <div className={styles.activitySection}>
        <label className={styles.activityLabel}>Nível de atividade</label>
        <PillToggle
          options={ACTIVITY_OPTIONS}
          value={safeActivity}
          onChange={(val) => onChange && onChange('activityLevel', val)}
        />
      </div>
    </div>
  );
}
