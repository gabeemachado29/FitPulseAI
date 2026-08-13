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

export default function BodyMeasurements({ data, onChange }) {
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
          value={data.height}
          onChange={(val) => onChange('height', Number(val))}
          placeholder="175"
        />
        <Input
          id="weight-input"
          label="Peso (kg)"
          type="number"
          value={data.weight}
          onChange={(val) => onChange('weight', Number(val))}
          placeholder="114"
        />
      </div>

      <div className={styles.grid2}>
        <Input
          id="age-input"
          label="Idade"
          type="number"
          value={data.age}
          onChange={(val) => onChange('age', Number(val))}
          placeholder="22"
        />

        <div className={styles.sexSection}>
          <label className={styles.sexLabel}>Sexo biológico</label>
          <PillToggle
            options={SEX_OPTIONS}
            value={data.sex || 'masculino'}
            onChange={(val) => onChange('sex', val)}
            fullWidth
          />
        </div>
      </div>

      <div className={styles.activitySection}>
        <label className={styles.activityLabel}>Nível de atividade</label>
        <PillToggle
          options={ACTIVITY_OPTIONS}
          value={data.activityLevel || 'sedentario'}
          onChange={(val) => onChange('activityLevel', val)}
        />
      </div>
    </div>
  );
}
