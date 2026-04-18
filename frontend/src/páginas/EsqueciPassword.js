import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EsqueciPassword() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const enviarPedido = async (e) => {
    e.preventDefault();
    try {
      // Este é o link oficial da biblioteca no Django
      await axios.post('http://127.0.0.1:8000/api/password_reset/', { email });
      setMensagem('Se este e-mail existir, receberás instruções em breve!');
    } catch (err) {
      setMensagem('Ocorreu um erro. Verifica o e-mail introduzido.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={enviarPedido} style={styles.card}>
        <h2>🔑 Recuperar Password</h2>
        <p>Introduz o teu e-mail de registo</p>
        {mensagem && <p style={{ color: '#27ae60' }}>{mensagem}</p>}
        <input 
          type="email" 
          placeholder="teu@email.com" 
          onChange={(e) => setEmail(e.target.value)} 
          style={styles.input} 
          required 
        />
        <button type="submit" style={styles.button}>Enviar E-mail de Recuperação</button>
        <p onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#3498db', marginTop: '15px' }}>
          Voltar ao Login
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
  card: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ddd' },
  button: { width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default EsqueciPassword;