import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './páginas/Dashboard'; 
import Login from './páginas/Loginn'; 
import Registo from './páginas/Registo'; 
import EsqueciPassword from './páginas/EsqueciPassword'; 
import RedefinirPassword from './páginas/RedefinirPassword';
import LandingPage from './páginas/LandingPage';
import Biblioteca from './páginas/Biblioteca';
import DashboardSoA from'./páginas/DashboardSoA';
import Auditoria from './páginas/Auditoria'; // Este é o Formulário com a Assinatura 
                                             // que serve tanto para criar como para editar
import Auditorias from './páginas/Auditorias'; // a Tabela de Auditorias
import Riscos from './páginas/Riscos';
import Perfil from './páginas/Perfil';
import Definicoes from './páginas/Definicoes';    
import CursosConcluidos from './páginas/CursosConcluidos';
import CursoPlayer from './páginas/CursoPlayer';

function App() {  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registo" element={<Registo />} />
        <Route path="/recuperar-password" element={<EsqueciPassword />} />
        <Route path="/redefinir-password" element={<RedefinirPassword />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        
        
        {/* A Rota principal mostra a TABELA (Auditorias no plural) */}
        <Route path="/auditorias" element={<Auditorias />} />
        
        {/* A Rota mostra o FORMULÁRIO vazio para criar */}
        <Route path="/auditorias/nova" element={<Auditoria />} />

        {/* A NOVA ROTA PARA CONTINUAR , o :id é o número da auditoria */}
        <Route path="/auditoria/:id" element={<Auditoria />} />
        
        <Route path="/riscos" element={<Riscos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/meu-soa" element={<DashboardSoA />} />  
        <Route path="/definicoes" element={<Definicoes />} />
        <Route path="/cursos-concluidos" element={<CursosConcluidos />} />
        <Route path="/curso/:id" element={<CursoPlayer />} />
      </Routes>
    </Router>
  );
}

export default App;