import { useEffect, useState } from 'react';
import { X, Check, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import styles from './ToastContainer.module.css';

const ICON_MAP = {
  success: Check,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function Toast({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);
  const IconComponent = ICON_MAP[toast.type] || Info;

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  // Auto-trigger exit animation before removal
  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, toast.duration - 300);

    return () => clearTimeout(exitTimer);
  }, [toast.duration]);

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${exiting ? styles.exiting : ''}`}
      role="alert"
    >
      <div className={`${styles.icon} ${styles[toast.type]}`}>
        <IconComponent size={16} />
      </div>

      <div className={styles.content}>
        <p className={styles.message}>{toast.message}</p>
      </div>

      <button
        type="button"
        className={styles.closeBtn}
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>

      <div
        className={`${styles.progressBar} ${styles[toast.type]}`}
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
