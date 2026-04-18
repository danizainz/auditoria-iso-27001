import React from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css'; 

function Layout({ children }) {
  return (
    <div className="dash-container">
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