import styles from './Badge.module.css';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon = null,
  className = '',
}) {
  const classNames = [
    styles.badge,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      {Icon && <Icon size={size === 'sm' ? 12 : 14} className={styles.icon} />}
      {children}
    </span>
  );
}
