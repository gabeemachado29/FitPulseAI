import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={size === 'sm' ? 16 : 18} className={styles.icon} />
      )}
      {children && <span className={styles.label}>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={size === 'sm' ? 16 : 18} className={styles.icon} />
      )}
    </button>
  );
}
