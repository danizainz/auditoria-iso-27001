import React from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css'; 
import ConsentBanner from './ConsentBanner';

function Layout({ children }) {
  return (
    <div className="dash-container">
      {/* BANNER DE CONSENTIMENTO DE COOKIES */}
      <ConsentBanner /> 
      {/* A Sidebar fica fixa do lado esquerdo */}
      <Sidebar />
      
      {/* O conteúdo da página entra aqui no meio */}
      <main className="dash-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;