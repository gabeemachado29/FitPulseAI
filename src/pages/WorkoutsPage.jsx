export default function WorkoutsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <p className="page-header__date">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          }).replace(/^\w/, (c) => c.toUpperCase())}
        </p>
        <h1 className="page-header__title">Treinos</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>Treinos em construção — Fase 4</p>
    </div>
  );
}
