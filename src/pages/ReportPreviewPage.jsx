import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNutrition } from '../hooks/useNutrition';
import { generateReportHTML } from '../services/pdfExportService';
import styles from './ReportPreviewPage.module.css';

export default function ReportPreviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { weeklyLogs } = useNutrition();

  const iframeRef = useRef(null);

  const htmlContent = generateReportHTML(profile, weeklyLogs || [], user);

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '840px' }}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} aria-label="Voltar" />
          <div>
            <h1 className="page-header__title" style={{ fontSize: '1.5rem' }}>Relatório PDF 📊</h1>
            <p className="page-header__date">Para enviar ao seu nutricionista</p>
          </div>
        </div>

        <Button variant="primary" icon={Printer} onClick={handlePrint}>
          Imprimir / Baixar PDF
        </Button>
      </header>

      <div className={styles.previewContainer}>
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          title="Preview Relatório"
          className={styles.iframe}
        />
      </div>
    </div>
  );
}
