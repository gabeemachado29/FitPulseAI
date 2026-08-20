import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Download,
  FileText,
  Trash2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { exportAllUserData, deleteUserAccount } from '../../services/accountService';
import { useToastStore } from '../../store/toastStore';
import { auth } from '../../config/firebase';
import styles from './LGPDPrivacyCard.module.css';

export default function LGPDPrivacyCard({ user }) {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const [exporting, setExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleExportData = async () => {
    if (!user?.uid) return;
    setExporting(true);
    try {
      await exportAllUserData(user.uid, user.email);
      addToast('✅ Arquivo de dados exportado com sucesso (LGPD)!', 'success', 4000);
    } catch (err) {
      console.error(err);
      addToast('Erro ao exportar seus dados. Tente novamente.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR') {
      setDeleteError('Digite EXCLUIR no campo abaixo para confirmar.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado');

      await deleteUserAccount(currentUser);
      addToast('Conta e todos os dados excluídos com sucesso.', 'info');
      setDeleteModalOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      if (err.message === 'REQUIRES_REAUTH') {
        setDeleteError('Por segurança, faça login novamente antes de excluir a conta.');
      } else {
        setDeleteError(err.message || 'Erro ao excluir conta.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card variant="bordered" padding="lg" className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <ShieldCheck size={20} color="var(--accent-green)" />
          </div>
          <div>
            <h3 className={styles.title}>Privacidade e Dados (LGPD)</h3>
            <p className={styles.subtitle}>
              Seus direitos de titular conforme a Lei nº 13.709/2018
            </p>
          </div>
        </div>

        <div className={styles.actionsGrid}>
          {/* Export Data */}
          <div className={styles.actionItem}>
            <div className={styles.actionInfo}>
              <span className={styles.actionTitle}>Portabilidade de Dados</span>
              <span className={styles.actionDesc}>
                Baixe um arquivo JSON com todo o seu histórico nutricional, água, treinos e perfil.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              loading={exporting}
              onClick={handleExportData}
            >
              Exportar Meus Dados
            </Button>
          </div>

          {/* Terms and Privacy Links */}
          <div className={styles.actionItem}>
            <div className={styles.actionInfo}>
              <span className={styles.actionTitle}>Documentos Legais</span>
              <span className={styles.actionDesc}>
                Consulte nossos termos de serviço e diretrizes de proteção de dados.
              </span>
            </div>
            <div className={styles.linksRow}>
              <Link to="/terms" className={styles.legalLink}>
                <FileText size={13} /> Termos de Uso <ExternalLink size={11} />
              </Link>
              <Link to="/privacy" className={styles.legalLink}>
                <ShieldCheck size={13} /> Privacidade <ExternalLink size={11} />
              </Link>
            </div>
          </div>

          {/* Delete Account */}
          <div className={styles.actionItem} style={{ borderBottom: 'none' }}>
            <div className={styles.actionInfo}>
              <span className={styles.actionTitle} style={{ color: 'var(--accent-red)' }}>
                Excluir Conta e Dados
              </span>
              <span className={styles.actionDesc}>
                Eliminação definitiva e irreversível de todas as informações do banco de dados.
              </span>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                setDeleteConfirmText('');
                setDeleteError('');
                setDeleteModalOpen(true);
              }}
            >
              Excluir Conta
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir Conta Permanentemente"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className={styles.warningBox}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
              <strong>Atenção LGPD:</strong> Esta ação excluirá todos os seus treinos, refeições, histórico de hidratação e dados cadastrais de forma <strong>definitiva</strong>.
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Para confirmar a exclusão permanente, digite <strong>EXCLUIR</strong> no campo abaixo:
          </p>

          <Input
            value={deleteConfirmText}
            onChange={(val) => {
              setDeleteConfirmText(val);
              setDeleteError('');
            }}
            placeholder="Digite EXCLUIR"
          />

          {deleteError && (
            <p style={{ color: 'var(--accent-red)', fontSize: '0.8125rem', margin: 0 }}>
              {deleteError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={deleting}
              disabled={deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR'}
              onClick={handleConfirmDelete}
            >
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
