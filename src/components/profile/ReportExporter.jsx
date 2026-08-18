import { useNavigate } from 'react';
import { FileText, Download } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import styles from './ReportExporter.module.css';

export default function ReportExporter() {
  const navigate = useNavigate();

  return (
    <Card variant="bordered" padding="lg" className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconCircle}>
          <FileText size={22} color="var(--accent-green)" />
        </div>
        <div>
          <h3 className={styles.title}>Relatório para Nutricionista 📊</h3>
          <p className={styles.subtitle}>Exporte o resumo semanal com gráficos e médias de macros</p>
        </div>
      </div>

      <Button
        variant="secondary"
        fullWidth
        icon={Download}
        onClick={() => navigate('/report')}
      >
        Gerar Relatório em PDF
      </Button>
    </Card>
  );
}
