import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function RedefinirPassword() {
  // O 'useSearchParams' é a ferramenta que vai ler o link e apanhar o ?token=...
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  
  const navigate = useNavigate();

  const alterarPassword = async (e) => {
    e.preventDefault();
    
    // Verificar se o utilizador não se enganou a escrever
    if (password !== confirmPassword) {
      setMensagem('As palavras-passe não coincidem!');
      setErro(true);
      return;
    }

    try {
      // 2. Enviar a nova password e o Token (a chave do e-mail) de volta para o Django
      await axios.post('https://auditoria-iso-27001.onrender.com/api/password_reset/confirm/', {
        token: token,
        password: password
      });
      
      setMensagem('Sucesso! A tua palavra-passe foi alterada.');
      setErro(false);
      
      // Espera 2 segundos e manda a pessoa para a página de Login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setMensagem('Erro ao alterar. O link pode ter expirado ou é inválido.');
      setErro(true);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={alterarPassword} style={styles.card}>
        <h2>🆕 Nova Palavra-passe</h2>
        <p>Escolhe a tua nova chave de acesso</p>
        
        {mensagem && (
          <p style={{ color: erro ? '#e74c3c' : '#2ecc71', fontWeight: 'bold' }}>
            {mensagem}
          </p>
        )}

        <input 
          type="password" 
          placeholder="Nova Password" 
          onChange={(e) => setPassword(e.target.value)} 
          style={styles.input} 
          required 
          minLength="8"
        />
        <input 
          type="password" 
          placeholder="Confirmar Password" 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          style={styles.input} 
          required 
        />
        <button type="submit" style={styles.button}>Confirmar Alteração</button>
      </form>
    </div>
  );
}


const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' },
  input: { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }
};

export default RedefinirPassword;