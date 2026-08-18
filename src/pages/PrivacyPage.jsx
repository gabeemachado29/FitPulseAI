import { useNavigate } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} aria-label="Voltar" />
        <div>
          <h1 className="page-header__title">Política de Privacidade</h1>
          <p className="page-header__date">LGPD & Play Store — Agosto de 2026</p>
        </div>
      </header>

      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>1. Coleta de Dados</h2>
        <p style={{ marginBottom: '1.25rem' }}>
          O <strong>FitPulseAI</strong> coleta exclusivamente os dados necessários para o funcionamento das ferramentas de nutrição e treino:
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
          <li>E-mail e nome (para autenticação via Firebase)</li>
          <li>Medidas corporais (altura, peso, idade, sexo biológico e nível de atividade)</li>
          <li>Registros de refeições, consumo de água e histórico de treinos</li>
          <li>Fotos de refeições enviadas voluntariamente para análise de IA</li>
        </ul>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>2. Uso das Fotos e Inteligência Artificial</h2>
        <p style={{ marginBottom: '1.25rem' }}>
          As imagens e descrições enviadas no Scanner são processadas via API do Google Gemini estritamente para extração de informações nutricionais. As imagens não são vendidas nem utilizadas para treinamento de modelos públicos sem consentimento.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>3. Integração com Terceiros (Strava)</h2>
        <p style={{ marginBottom: '1.25rem' }}>
          Caso você opte por conectar sua conta do Strava, acessamos apenas os dados de atividades públicas (distância, duração e calorias) com autorização OAuth explícita. Você pode revogar o acesso a qualquer momento.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>4. Seus Direitos (LGPD) e Exclusão Total</h2>
        <p style={{ marginBottom: '1rem' }}>
          Em conformidade com a LGPD e diretrizes da Google Play Store, você tem o direito de excluir permanentemente todos os seus dados. Ao clicar em <strong>"Excluir Conta"</strong> na tela de Perfil, todos os registros de refeições, treinos, hidratação e dados pessoais são deletados de forma irreversível do nosso banco de dados.
        </p>
      </div>
    </div>
  );
}
