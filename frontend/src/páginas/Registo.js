import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; 

function Registo() {
  const navigate = useNavigate();
  
  const [passo, setPasso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [dados, setDados] = useState({
    nome: '', email: '', password: '', codigo: '', objetivo: '', empresa: ''
  });

  const handleRegisto = async (e) => {
    e.preventDefault();
    setLoading(true); setErro('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/registar/`, {
        nome_completo: dados.nome,
        email: dados.email,
        password: dados.password
      });
      setPasso(2);
    } catch (err) {
      const mensagemErro = err.response?.data?.erro || 'Erro no registo.';
      
      if (err.response && err.response.status === 400) {
        setErro(mensagemErro + " A redirecionar para o login...");
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErro(mensagemErro);
      }
    }
    setLoading(false);
  };

  const handleVerificarOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setErro('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/verificar-otp/`, {
        email: dados.email,
        codigo: dados.codigo
      });
      
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('nomeUser', dados.nome); 
      localStorage.setItem('emailUser', dados.email); 
      
      setPasso(3);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Código incorreto.');
    }
    setLoading(false);
  };

  const handlePerfil = async (e) => {
    e.preventDefault();
    setLoading(true); setErro('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/finalizar-perfil/`, {
        objetivo: dados.objetivo,
        empresa: dados.empresa
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/auditorias');
    } catch (err) {
      setErro('Erro ao gravar perfil.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '400px' }}>
        
        {passo === 1 && (
          <form onSubmit={handleRegisto}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Criar Conta</h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Registe-se para aceder à plataforma.</p>
            {erro && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{erro}</p>}
            
            <input type="text" placeholder="Nome Completo" required value={dados.nome} onChange={e => setDados({...dados, nome: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="E-mail Corporativo" required value={dados.email} onChange={e => setDados({...dados, email: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Palavra-passe" required value={dados.password} onChange={e => setDados({...dados, password: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc' }} />
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'A Enviar Código...' : 'Avançar'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
              <span style={{color: '#3b82f6', cursor: 'pointer'}} onClick={() => navigate('/login')}>Já tem conta? Fazer Login</span>
            </p>
          </form>
        )}

        {passo === 2 && (
          <form onSubmit={handleVerificarOTP}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Verifica o E-mail</h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Enviámos um código de 6 dígitos para <strong>{dados.email}</strong>.</p>
            {erro && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{erro}</p>}
            
            <input type="text" placeholder="Código de 6 dígitos" required maxLength="6" value={dados.codigo} onChange={e => setDados({...dados, codigo: e.target.value})} style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '20px', textAlign: 'center', letterSpacing: '5px' }} />
            
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'A verificar...' : 'Verificar e Entrar'}
            </button>
          </form>
        )}

        {passo === 3 && (
          <form onSubmit={handlePerfil}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Bem-vindo, {dados.nome}!</h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>O que te traz à plataforma?</p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button type="button" onClick={() => setDados({...dados, objetivo: 'Auditar'})} style={{ flex: 1, padding: '20px 10px', border: dados.objetivo === 'Auditar' ? '2px solid #10b981' : '1px solid #ccc', borderRadius: '8px', backgroundColor: dados.objetivo === 'Auditar' ? '#ecfdf5' : 'white', cursor: 'pointer' }}>
                🏢<br/><strong>Vou Auditar</strong>
              </button>
              <button type="button" onClick={() => setDados({...dados, objetivo: 'Aprender'})} style={{ flex: 1, padding: '20px 10px', border: dados.objetivo === 'Aprender' ? '2px solid #3b82f6' : '1px solid #ccc', borderRadius: '8px', backgroundColor: dados.objetivo === 'Aprender' ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                📚<br/><strong>Vou Aprender</strong>
              </button>
            </div>

            <p style={{ fontSize: '14px', marginBottom: '5px', fontWeight: 'bold' }}>Qual é a tua Empresa? (Opcional)</p>
            <input type="text" placeholder="Ex: EDP, Worten..." value={dados.empresa} onChange={e => setDados({...dados, empresa: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ccc' }} />

            <button type="submit" disabled={!dados.objetivo || loading} style={{ width: '100%', padding: '12px', backgroundColor: dados.objetivo ? '#111827' : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Entrar no Dashboard ➔
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Registo;