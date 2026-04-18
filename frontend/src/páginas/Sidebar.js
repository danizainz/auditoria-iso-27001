import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const nomeCompletoDaBD = localStorage.getItem('nomeUser') || "Utilizador ISO";
  const nomeNoBotao = nomeCompletoDaBD; 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nomeUser');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  return (
    <aside className="dash-sidebar">
      
      {/* */}
      <div 
        className="dash-logo" 
        onClick={() => navigate('/dashboard')} 
        style={{ cursor: 'pointer' }}
        title="Ir para a Página Inicial"
      >
        Auditoria <span style={{color: '#4f46e5'}}>ISO 27001</span>
      </div>
      
      <nav className="dash-nav">
        <Link to="/dashboard" className={`dash-menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>🏠 Página Inicial</Link>
        <Link to="/auditorias" className={`dash-menu-item ${isActive('/auditorias')}`}>📋 Auditorias</Link>
        <Link to="/riscos" className={`dash-menu-item ${isActive('/riscos')}`}>🛡️ Gestão de Riscos</Link>
        <Link to="/biblioteca" className={`dash-menu-item ${isActive('/biblioteca')}`}>📚 Biblioteca</Link>
        <Link to="/perfil" className={`dash-menu-item ${isActive('/perfil')}`}>👤 Meu Perfil</Link>
        <Link to="/definicoes" className={`dash-menu-item ${isActive('/definicoes')}`}>⚙️ Definições</Link>
      </nav>

      {/* SECÇÃO DO PERFIL E LOGOUT */}
      <div className="sidebar-bottom">
        <Link to="/perfil" className="sidebar-profile-btn">
          👤 {nomeNoBotao}
        </Link>
        <button onClick={handleLogout} className="logout-btn">
          🚪 Terminar Sessão
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;