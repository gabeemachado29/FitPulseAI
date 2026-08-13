import { useState } from 'react';
import styles from './Input.module.css';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  icon: Icon = null,
  suffix = '',
  error = '',
  disabled = false,
  required = false,
  multiline = false,
  rows = 4,
  className = '',
  autoComplete,
  min,
  max,
  step,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const wrapClass = [
    styles.inputWrap,
    focused ? styles.focused : '',
    error ? styles.hasError : '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const sharedProps = {
    id,
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    disabled,
    required,
    autoComplete,
    className: `${styles.input} ${Icon ? styles.hasIcon : ''} ${suffix ? styles.hasSuffix : ''}`,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    ...props,
  };

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={wrapClass}>
        {Icon && (
          <Icon size={18} className={styles.icon} />
        )}
        {multiline ? (
          <textarea {...sharedProps} rows={rows} />
        ) : (
          <input {...sharedProps} type={type} min={min} max={max} step={step} />
        )}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
