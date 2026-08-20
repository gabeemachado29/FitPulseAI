import { useState, useEffect } from 'react';
import { User, Lock, Phone, Calendar, Check, KeyRound, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
  formatPhoneBR,
  validatePasswordStrength,
  updateUserPasswordSafe,
} from '../../services/accountService';
import { useToastStore } from '../../store/toastStore';
import { auth } from '../../config/firebase';
import styles from './EditProfileModal.module.css';

export default function EditProfileModal({ isOpen, onClose, profile, onSaveProfile }) {
  const addToast = useToastStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'password'

  // Personal fields
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [birthDate, setBirthDate] = useState(profile?.birthDate || '');
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setBirthDate(profile.birthDate || '');
    }
  }, [profile]);

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneBR(e.target.value);
    setPhone(formatted);
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      await onSaveProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        birthDate: birthDate.trim(),
      });
      addToast('Dados do perfil atualizados com sucesso!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Erro ao salvar dados do perfil.', 'error');
    } finally {
      setSavingPersonal(false);
    }
  };

  const strength = validatePasswordStrength(newPassword);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação de senha não coincide com a nova senha.');
      return;
    }

    if (!strength.valid) {
      setPasswordError('A senha deve conter maiúsculas, minúsculas e números.');
      return;
    }

    setSavingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Usuário não autenticado.');

      const msg = await updateUserPasswordSafe(currentUser, currentPassword, newPassword);
      addToast(msg, 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      setPasswordError(err.message || 'Erro ao alterar senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil">
      <div className={styles.modalContent}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'personal' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={15} /> Dados Pessoais
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'password' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={15} /> Alterar Senha
          </button>
        </div>

        {activeTab === 'personal' ? (
          <form onSubmit={handleSavePersonal} className={styles.form}>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Nome</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Seu nome"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Sobrenome</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Seu sobrenome"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Phone size={13} style={{ marginRight: 4 }} /> Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Calendar size={13} style={{ marginRight: 4 }} /> Data de Nascimento
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.btnRow}>
              <Button variant="ghost" fullWidth onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={Check}
                fullWidth
                loading={savingPersonal}
                type="submit"
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Senha Atual</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nova Senha</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Password strength meter */}
            {newPassword.length > 0 && (
              <div className={styles.strengthWrap}>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width: `${(strength.score / 5) * 100}%`,
                      backgroundColor:
                        strength.score < 3
                          ? 'var(--accent-red)'
                          : strength.score < 4
                          ? 'var(--accent-orange)'
                          : 'var(--accent-green)',
                    }}
                  />
                </div>
                <span className={styles.strengthText}>
                  {strength.score < 3 ? 'Senha fraca' : strength.score < 4 ? 'Senha média' : 'Senha forte'}
                </span>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Confirmar Nova Senha</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {passwordError && (
              <div className={styles.errorAlert}>
                <AlertCircle size={15} />
                <span>{passwordError}</span>
              </div>
            )}

            <div className={styles.btnRow}>
              <Button variant="ghost" fullWidth onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button
                variant="primary"
                icon={KeyRound}
                fullWidth
                loading={savingPassword}
                type="submit"
              >
                Atualizar Senha
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
