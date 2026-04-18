import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css'; 

function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return null;

  return (
    <div className="lp-container">
      {/* 1. CABEÇALHO */}
      <header className="lp-header">
        <div>
          <span style={{ fontWeight: '900', fontSize: '24px', color: '#111827' }}>Auditoria</span>
          <span style={{ color: '#6366f1', fontWeight: '900', fontSize: '24px' }}> ISO 27001</span>
        </div>
        <div className="lp-nav-buttons">
          <Link to="/login" className="lp-login-link">Log in</Link>
          <Link to="/registo" className="lp-signup-btn">Criar conta grátis</Link>
        </div>
      </header>

      {/* 2. HERO SECTION (A introdução) */}
      <main className="lp-main">
        <h1 className="lp-title">Uma melhor forma de trabalhar</h1>
        <p className="lp-subtitle">
          Dá à tua equipa as ferramentas, conhecimento e confiança para realizar auditorias com segurança, cumprir as normas ISO 27001 e melhorar todos os dias.
        </p>

        <div className="lp-cta-group">
          <Link to="/registo" className="lp-btn-primary">Começar gratuitamente</Link>
          <Link to="/login" className="lp-btn-secondary">Login</Link>
        </div>
      </main>

      {/* 3. FUNCIONALIDADES (Grelha de Cards) */}
      <section className="lp-features-section">
        <div className="lp-features-grid">
          {/* Card 1 */}
          <div className="lp-feature-card">
            <div className="lp-feature-icon">📋</div>
            <h3>Auditorias de Conformidade</h3>
            <p>Transforma checklists em fluxos de trabalho poderosos. Realiza auditorias digitais em tempo real.</p>
            <span className="lp-learn-more">Saber mais →</span>
          </div>
          {/* Card 2 */}
          <div className="lp-feature-card">
            <div className="lp-feature-icon">⚠️</div>
            <h3>Gestão de Incidentes</h3>
            <p>Reporta não conformidades, inicia investigações e mantém um registo claro do que aconteceu.</p>
            <span className="lp-learn-more">Saber mais →</span>
          </div>
          {/* Card 3 */}
          <div className="lp-feature-card">
            <div className="lp-feature-icon">📚</div>
            <h3>Formação e Biblioteca</h3>
            <p>Acede a manuais, templates e normas ISO para garantires que a tua equipa está sempre atualizada.</p>
            <span className="lp-learn-more">Saber mais →</span>
          </div>
          {/* Card 4 */}
          <div className="lp-feature-card">
            <div className="lp-feature-icon">📊</div>
            <h3>Análise de Dados</h3>
            <p>Acompanha tendências e identifica riscos com dashboards de análise em tempo real para a gestão.</p>
            <span className="lp-learn-more">Saber mais →</span>
          </div>
          {/* Card 5 */}
          <div className="lp-feature-card">
            <div className="lp-feature-icon">📂</div>
            <h3>Gestão de Documentos</h3>
            <p>Armazena, organiza e acede a documentos críticos em qualquer lugar, com suporte offline.</p>
            <span className="lp-learn-more">Saber mais →</span>
          </div>
          {/* Card 6 */}
          <div className="lp-feature-card">
            <div className="lp-feature-icon">⚙️</div>
            <h3>Planos de Tratamento</h3>
            <p>Atribui ações corretivas, define prazos e acompanha a resolução de problemas passo a passo.</p>
            <span className="lp-learn-more">Saber mais →</span>
          </div>
        </div>
      </section>

      {}
      <section className="lp-bottom-banner">
        <h2>Referência na gestão de segurança ISO 27001</h2>
        <div className="lp-banner-benefits">
          <span>✅ Zero papel</span>
          <span>✅ Redução de incidentes</span>
          <span>✅ Mitigação de riscos</span>
          <span>✅ Maior produtividade</span>
        </div>
        <div className="lp-banner-ctas">
          <Link to="/registo" className="lp-btn-primary banner-btn">Começar gratuitamente</Link>
        </div>
      </section>

      {/* 5. FOOTER (Rodapé) */}
      <footer className="lp-footer">
        <div className="lp-footer-grid">
          <div className="lp-footer-col">
            <h4>Produto</h4>
            <Link to="#">Preços</Link>
            <Link to="#">Marcar Demo</Link>
            <Link to="#">Atualizações</Link>
          </div>
          <div className="lp-footer-col">
            <h4>Suporte</h4>
            <Link to="#">Centro de Ajuda</Link>
            <Link to="#">Contactos</Link>
            <Link to="#">Documentação API</Link>
          </div>
          <div className="lp-footer-col">
            <h4>Recursos</h4>
            <Link to="#">Biblioteca de Normas</Link>
            <Link to="#">Guias de Checklist</Link>
            <Link to="#">Blog</Link>
          </div>
          <div className="lp-footer-col">
            <h4>Empresa</h4>
            <Link to="#">Sobre Nós</Link>
            <Link to="#">Carreiras</Link>
            <Link to="#">Parcerias</Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} AuditoriaISO.</p>
          <div className="lp-footer-legal">
            <Link to="#">Privacidade</Link>
            <Link to="#">Termos e Condições</Link>
            <Link to="#">Segurança</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;