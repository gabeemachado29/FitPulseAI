import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <p className="page-header__date">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).replace(/^\w/, (c) => c.toUpperCase())}
        </p>
        <h1 className="page-header__title">Olá, Usuário 💪</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>Dashboard em construção — Fase 4</p>
    </div>
  );
}
