import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { UserPlus, Mail, Lock, Check, X } from 'lucide-react';
import {
  getFirebaseAuthErrorMessage,
  validatePasswordStrength,
  performGoogleSignIn,
} from '../services/accountService';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordCheck = validatePasswordStrength(password);
  const strengthColors = ['var(--accent-red)', 'var(--accent-red)', 'var(--accent-orange)', 'var(--accent-yellow)', 'var(--accent-green)', 'var(--accent-green)'];
  const strengthLabels = ['', 'Fraca', 'Fraca', 'Média', 'Boa', 'Forte'];

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        GoogleAuth.initialize();
      } catch (e) {
        console.warn('GoogleAuth init:', e);
      }
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }

    if (!passwordCheck.valid) {
      setError('Senha não atende os requisitos mínimos de segurança.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(getFirebaseAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');

    if (!acceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }

    setLoading(true);

    try {
      const user = await performGoogleSignIn();
      if (user) {
        navigate('/');
      }
    } catch (err) {
      console.error('Google register error:', err);
      const code = err?.code || err?.message;
      if (code !== 'auth/popup-closed-by-user' && code !== '12500') {
        setError(getFirebaseAuthErrorMessage(code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.iconWrap}>
          <UserPlus size={28} color="var(--accent-green)" />
        </div>

        <h1 className={styles.title}>Criar Conta</h1>
        <p className={styles.subtitle}>Comece sua jornada no FitPulseAI</p>

        <div className={styles.card}>
          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" className={styles.googleIcon}>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Cadastrar com o Google
          </button>

          <div className={styles.divider}>
            <span>ou crie com e-mail</span>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="reg-email" className={styles.label}>E-mail</label>
              <div className={styles.inputWrap}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="reg-email"
                  type="email"
                  className={styles.input}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="reg-pass" className={styles.label}>Senha</label>
              <div className={styles.inputWrap}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="reg-pass"
                  type="password"
                  className={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Força da senha:</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strengthColors[passwordCheck.score] }}>
                      {strengthLabels[passwordCheck.score]}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          borderRadius: '2px',
                          backgroundColor: level <= passwordCheck.score ? strengthColors[passwordCheck.score] : 'rgba(255,255,255,0.1)',
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="reg-pass-confirm" className={styles.label}>Confirmar Senha</label>
              <div className={styles.inputWrap}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="reg-pass-confirm"
                  type="password"
                  className={styles.input}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: '0.25rem', display: 'block' }}>
                  As senhas não coincidem
                </span>
              )}
            </div>

            {/* Mandatory Terms Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '0.2rem', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                required
              />
              <label htmlFor="terms-checkbox" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: '1.4', cursor: 'pointer' }}>
                Li e concordo com os{' '}
                <Link to="/terms" target="_blank" style={{ color: 'var(--accent-green)', textDecoration: 'underline' }}>
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="/privacy" target="_blank" style={{ color: 'var(--accent-green)', textDecoration: 'underline' }}>
                  Política de Privacidade
                </Link>.
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !acceptedTerms}
            >
              {loading ? 'Criando conta...' : 'Cadastrar'}
            </button>
          </form>

          <p className={styles.footerText}>
            Já tem uma conta?{' '}
            <Link to="/login" className={styles.link}>
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
