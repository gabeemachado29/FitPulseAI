import styles from './Card.module.css';

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  onClick,
  className = '',
  animate = false,
  ...props
}) {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`pad${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    onClick ? styles.clickable : '',
    animate ? styles.animate : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={classNames}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
