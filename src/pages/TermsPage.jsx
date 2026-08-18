import { useNavigate } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} aria-label="Voltar" />
        <div>
          <h1 className="page-header__title">Termos de Uso</h1>
          <p className="page-header__date">Última atualização: Agosto de 2026</p>
        </div>
      </header>

      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>1. Aceitação dos Termos</h2>
        <p style={{ marginBottom: '1.25rem' }}>
          Ao criar uma conta ou utilizar o <strong>FitPulseAI</strong>, você concorda expressamente com estes Termos de Uso. Caso não concorde com qualquer disposição, não utilize o aplicativo.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>2. Descrição do Serviço</h2>
        <p style={{ marginBottom: '1.25rem' }}>
          O FitPulseAI é uma plataforma de auxílio no acompanhamento de nutrição, hidratação e treinos esportivos, utilizando Inteligência Artificial (Google Gemini) para estimar valores nutricionais.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>3. Isenção de Responsabilidade Médica</h2>
        <p style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: 'rgba(255, 109, 0, 0.1)', borderLeft: '3px solid var(--accent-orange)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}>
          <strong>ATENÇÃO:</strong> As estimativas de calorias, macronutrientes e sugestões geradas por IA não constituem aconselhamento médico ou nutricional profissional. Consulte sempre um médico ou nutricionista certificado antes de iniciar dietas ou treinos intensos.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>4. Contas e Segurança</h2>
        <p style={{ marginBottom: '1.25rem' }}>
          Você é responsável por manter a confidencialidade de suas credenciais de acesso. O uso indevido da conta sob sua senha é de sua inteira responsabilidade.
        </p>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>5. Cancelamento e Exclusão</h2>
        <p style={{ marginBottom: '1rem' }}>
          Você pode excluir sua conta e todos os seus dados a qualquer momento diretamente na aba Perfil do aplicativo.
        </p>
      </div>
    </div>
  );
}
