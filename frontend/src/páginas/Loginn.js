import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Loginn.css'; 

function Loginn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [aguardando2FA, setAguardando2FA] = useState(false);
  const [codigo2FA, setCodigo2FA] = useState('');

  const manejarLoginInicial = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      // Bate na porta do Passo 1
      const response = await axios.post('http://127.0.0.1:8000/api/login-step-1/', {
        email: email.trim(),
        password: password
      });

      if (response.data.requer_2fa) {
        setAguardando2FA(true);
      } else {
        finalizarLogin(response.data);
      }
    } catch (err) {
      setErro('Credenciais inválidas ou erro de conexão.');
    }
  };

  const manejarVerificacao2FA = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login-step-2-verify/', {
        email: email.trim(),
        codigo: codigo2FA.trim()
      });
      finalizarLogin(response.data);
    } catch (err) {
      setErro('Código de autenticação incorreto.');
    }
  };

  const finalizarLogin = (data) => {
    localStorage.setItem('token', data.access);
    localStorage.setItem('nomeUser', data.nome);
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">🛡️ Auditoria ISO</h2>
        <p className="login-subtitle">
          {aguardando2FA ? "Segurança em Duas Etapas" : "Introduza as suas credenciais"}
        </p>

        {erro && <div className="login-error-box">{erro}</div>}

        {!aguardando2FA ? (
          <form onSubmit={manejarLoginInicial}>
            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Palavra-passe"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="login-btn-primary">Entrar</button>
            <div className="login-links-wrapper">
              <span className="login-link" onClick={() => navigate('/recuperar-password')}>Esqueceu-se?</span>
              <span className="login-link" onClick={() => navigate('/registo')}>Criar conta</span>
            </div>
          </form>
        ) : (
          <form onSubmit={manejarVerificacao2FA}>
            <p className="login-subtitle">Insira o código do seu telemóvel</p>
            <input
              type="text"
              placeholder="000000"
              maxLength="6"
              className="login-input-2fa"
              value={codigo2FA}
              onChange={(e) => setCodigo2FA(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="login-btn-primary">Verificar</button>
            <button type="button" className="login-btn-secondary" onClick={() => setAguardando2FA(false)}>Voltar</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Loginn;