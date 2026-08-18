import { useState } from 'react';
import { X, Activity, Heart, Flame, Check } from 'lucide-react';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import styles from './HealthConnectModal.module.css';

export default function HealthConnectModal({ isOpen, isConnected, currentProvider, onConnect, onDisconnect, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSelectProvider = async (provider) => {
    setLoading(true);
    try {
      await onConnect(provider);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await onDisconnect();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Activity size={22} color="var(--accent-green)" />
            <h2 className={styles.title}>Smartwatch & Saúde ⌚</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <Loader size={36} />
            <p className={styles.loadingText}>Conectando ao aplicativo de saúde...</p>
          </div>
        ) : isConnected ? (
          <div className={styles.connectedContent}>
            <div className={styles.connectedBadge}>
              <Check size={16} />
              <span>Conectado ao {currentProvider === 'apple_health' ? 'Apple Health' : 'Google Fit'}</span>
            </div>

            <p className={styles.description}>
              Seus passos diários, frequência cardíaca e calorias ativas são sincronizados automaticamente.
            </p>

            <Button variant="danger" fullWidth onClick={handleDisconnect}>
              Desconectar Aplicativo de Saúde
            </Button>
          </div>
        ) : (
          <div className={styles.selectContent}>
            <p className={styles.description}>
              Selecione seu aplicativo de saúde para importar passos e batimentos cardíacos automaticamente:
            </p>

            <div className={styles.providerList}>
              <button
                type="button"
                className={styles.providerCard}
                onClick={() => handleSelectProvider('google_fit')}
              >
                <div className={styles.providerIcon}>💚</div>
                <div className={styles.providerInfo}>
                  <span className={styles.providerTitle}>Google Fit</span>
                  <span className={styles.providerSub}>Android & Google Wear OS</span>
                </div>
              </button>

              <button
                type="button"
                className={styles.providerCard}
                onClick={() => handleSelectProvider('apple_health')}
              >
                <div className={styles.providerIcon}>❤️</div>
                <div className={styles.providerInfo}>
                  <span className={styles.providerTitle}>Apple Health</span>
                  <span className={styles.providerSub}>iOS & Apple Watch</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
