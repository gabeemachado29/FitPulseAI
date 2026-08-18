import { useState, useEffect } from 'react';
import { Footprints, Heart, Flame, Watch } from 'lucide-react';
import Card from '../ui/Card';
import HealthConnectModal from './HealthConnectModal';
import { useAuth } from '../../hooks/useAuth';
import { fetchHealthConnectData, connectHealthProvider, disconnectHealthProvider } from '../../services/healthConnectService';
import styles from './HealthConnectCard.module.css';

export default function HealthConnectCard() {
  const { user } = useAuth();
  const [data, setData] = useState({ connected: false, steps: 0, heartRateBpm: 0, activeCalories: 0 });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchHealthConnectData(user.uid).then(setData);
  }, [user]);

  const handleConnect = async (provider) => {
    const updated = await connectHealthProvider(user.uid, provider);
    setData(updated);
  };

  const handleDisconnect = async () => {
    const updated = await disconnectHealthProvider(user.uid);
    setData(updated);
  };

  return (
    <>
      <Card variant="bordered" padding="md" className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Watch size={18} color="var(--accent-green)" />
            <span>Smartwatch & Passos</span>
          </div>

          <button
            type="button"
            className={styles.connectBtn}
            onClick={() => setModalOpen(true)}
          >
            {data.connected ? '✓ Conectado' : '+ Conectar'}
          </button>
        </div>

        {data.connected ? (
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Footprints size={18} color="var(--accent-green)" />
              <div>
                <span className={styles.statVal}>{data.steps.toLocaleString('pt-BR')}</span>
                <span className={styles.statLbl}>Passos</span>
              </div>
            </div>

            <div className={styles.statItem}>
              <Heart size={18} color="var(--accent-red)" />
              <div>
                <span className={styles.statVal}>{data.heartRateBpm} bpm</span>
                <span className={styles.statLbl}>Batimentos</span>
              </div>
            </div>

            <div className={styles.statItem}>
              <Flame size={18} color="var(--accent-orange)" />
              <div>
                <span className={styles.statVal}>{data.activeCalories} kcal</span>
                <span className={styles.statLbl}>Ativas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.unconnectedBanner} onClick={() => setModalOpen(true)}>
            <span>Sincronize passos, batimentos e calorias ativas do seu relógio</span>
          </div>
        )}
      </Card>

      <HealthConnectModal
        isOpen={modalOpen}
        isConnected={data.connected}
        currentProvider={data.provider}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
