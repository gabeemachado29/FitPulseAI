import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Flame, Target } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Leaderboard from '../components/social/Leaderboard';
import ChallengeCard from '../components/social/ChallengeCard';
import { useAuth } from '../hooks/useAuth';
import { useWater } from '../hooks/useWater';
import { useToastStore } from '../store/toastStore';
import { fetchWeeklyLeaderboard, addFriendByEmail } from '../services/socialService';
import { fetchChallenges, joinChallenge } from '../services/challengeService';
import styles from './SocialPage.module.css';

export default function SocialPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dailyWater } = useWater();
  const addToast = useToastStore((state) => state.addToast);

  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchWeeklyLeaderboard(user, dailyWater?.totalMl || 0).then(setLeaderboard);
    fetchChallenges().then(setChallenges);
  }, [user, dailyWater]);

  const handleAddFriend = async () => {
    if (!friendEmail.trim()) return;
    setAdding(true);
    try {
      await addFriendByEmail(user.uid, user.displayName, friendEmail.trim());
      addToast(`Solicitação enviada para ${friendEmail}`, 'success');
      setFriendEmail('');
      setAddModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Erro ao adicionar amigo.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    const updated = await joinChallenge(challengeId);
    setChallenges(updated);
    addToast('Você entrou no desafio! Boa sorte! 🔥', 'success');
  };

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} aria-label="Voltar" />
          <div>
            <h1 className="page-header__title">Comunidade & Desafios 👥</h1>
            <p className="page-header__date">Rankings e desafios entre amigos</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={UserPlus}
          onClick={() => setAddModalOpen(true)}
        >
          Add Amigo
        </Button>
      </header>

      {/* Leaderboard Section */}
      <Leaderboard items={leaderboard} />

      {/* Active Challenges Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Target size={18} color="var(--accent-green)" />
          <h3 className={styles.sectionTitle}>Desafios da Comunidade 🎯</h3>
        </div>

        {challenges.map((c) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            onJoin={handleJoinChallenge}
          />
        ))}
      </div>

      {/* Add Friend Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Adicionar Amigo"
      >
        <div className={styles.addForm}>
          <p className={styles.addDesc}>
            Digite o e-mail do seu amigo cadastrado no FitPulseAI para entrarem no mesmo ranking:
          </p>

          <Input
            type="email"
            placeholder="amigo@exemplo.com"
            value={friendEmail}
            onChange={setFriendEmail}
          />

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" fullWidth onClick={() => setAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              fullWidth
              loading={adding}
              disabled={!friendEmail.trim()}
              onClick={handleAddFriend}
            >
              Enviar Convite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
