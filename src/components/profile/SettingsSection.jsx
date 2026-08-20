import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Globe, Bell, Check } from 'lucide-react';
import Card from '../ui/Card';
import { useToastStore } from '../../store/toastStore';
import styles from './SettingsSection.module.css';

export function applyTheme(themeName) {
  const root = document.documentElement;
  if (themeName === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (themeName === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  localStorage.setItem('fitpulse_theme', themeName);
}

export default function SettingsSection({ profile, onUpdateSettings }) {
  const addToast = useToastStore((state) => state.addToast);

  const [theme, setTheme] = useState(
    localStorage.getItem('fitpulse_theme') || profile?.theme || 'system'
  );
  const [language, setLanguage] = useState(
    localStorage.getItem('fitpulse_lang') || profile?.language || 'pt-BR'
  );
  const [notifications, setNotifications] = useState({
    hydration: profile?.notifications?.hydration ?? true,
    meals: profile?.notifications?.meals ?? true,
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    if (onUpdateSettings) {
      onUpdateSettings({ theme: newTheme });
    }
    addToast(`Tema alterado para ${newTheme === 'light' ? 'Claro' : newTheme === 'dark' ? 'Escuro' : 'Sistema'}`, 'info', 2000);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('fitpulse_lang', newLang);
    if (onUpdateSettings) {
      onUpdateSettings({ language: newLang });
    }
    addToast('Idioma atualizado.', 'info', 2000);
  };

  const handleToggleNotification = (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    if (onUpdateSettings) {
      onUpdateSettings({ notifications: next });
    }
    addToast(`Notificações de ${key === 'hydration' ? 'hidratação' : 'refeições'} ${next[key] ? 'ativadas' : 'desativadas'}.`, 'info', 2000);
  };

  return (
    <Card variant="bordered" padding="lg" className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <Settings size={20} color="var(--accent-green)" />
        </div>
        <div>
          <h3 className={styles.title}>Configurações do Aplicativo</h3>
          <p className={styles.subtitle}>Aparência, idioma e preferências</p>
        </div>
      </div>

      <div className={styles.list}>
        {/* Theme Setting */}
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <span className={styles.settingTitle}>Aparência do Tema</span>
            <span className={styles.settingDesc}>Escolha entre modo claro, escuro ou automático</span>
          </div>

          <div className={styles.themeGroup}>
            <button
              type="button"
              className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
              onClick={() => handleThemeChange('light')}
              title="Tema Claro"
              aria-label="Tema Claro"
            >
              <Sun size={15} />
              <span>Claro</span>
            </button>
            <button
              type="button"
              className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
              onClick={() => handleThemeChange('dark')}
              title="Tema Escuro"
              aria-label="Tema Escuro"
            >
              <Moon size={15} />
              <span>Escuro</span>
            </button>
            <button
              type="button"
              className={`${styles.themeBtn} ${theme === 'system' ? styles.themeBtnActive : ''}`}
              onClick={() => handleThemeChange('system')}
              title="Tema do Sistema"
              aria-label="Tema do Sistema"
            >
              <Monitor size={15} />
              <span>Sistema</span>
            </button>
          </div>
        </div>

        {/* Language Setting */}
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={15} color="var(--text-secondary)" />
              <span className={styles.settingTitle}>Idioma do Sistema</span>
            </div>
            <span className={styles.settingDesc}>Selecione o idioma de exibição</span>
          </div>

          <select
            className={styles.select}
            value={language}
            onChange={handleLanguageChange}
            aria-label="Selecionar Idioma"
          >
            <option value="pt-BR">🇧🇷 Português (Brasil)</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>

        {/* Notifications Setting */}
        <div className={styles.settingItem} style={{ borderBottom: 'none' }}>
          <div className={styles.settingInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={15} color="var(--text-secondary)" />
              <span className={styles.settingTitle}>Lembretes & Notificações</span>
            </div>
            <span className={styles.settingDesc}>Avisos inteligentes para manter a constância</span>
          </div>

          <div className={styles.togglesWrap}>
            <label className={styles.toggleLabel}>
              <span>💧 Água</span>
              <input
                type="checkbox"
                checked={notifications.hydration}
                onChange={() => handleToggleNotification('hydration')}
                className={styles.toggleCheckbox}
              />
            </label>
            <label className={styles.toggleLabel}>
              <span>🍽️ Refeições</span>
              <input
                type="checkbox"
                checked={notifications.meals}
                onChange={() => handleToggleNotification('meals')}
                className={styles.toggleCheckbox}
              />
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}
