import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './Layout'; 
import './Definicoes.css';

function Definicoes() {
  const [abaAtiva, setAbaAtiva] = useState('user_settings');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para Detalhes (Email)
  const [modoEdicaoDetalhes, setModoEdicaoDetalhes] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const [showModalEmail, setShowModalEmail] = useState(false);
  const [codigoEmail, setCodigoEmail] = useState('');

  // Estados para Password
  const [passwordAtual, setPasswordAtual] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  const [codigo2FAPassword, setCodigo2FAPassword] = useState('');

  // Estados para Segurança (2FA / Telemóvel)
  const [modoEdicaoSeguranca, setModoEdicaoSeguranca] = useState(false);
  const [telemovel, setTelemovel] = useState('');
  const [is2FA, setIs2FA] = useState(false);
  const [showModal2FA, setShowModal2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [codigoAtivacao, setCodigoAtivacao] = useState('');

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      const response = await axios.get('http://127.0.0.1:8000/api/user-profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
      setNovoEmail(response.data.email);
      setTelemovel(response.data.telemovel || '');
      setIs2FA(response.data.dois_fatores_ativo || false);
      setLoading(false);
    } catch (error) { setLoading(false); }
  };

  // --- LÓGICA DE ALTERAÇÃO DE EMAIL ---
  const manejarSolicitarEmail = async () => {
    if (novoEmail === userData.email) return setModoEdicaoDetalhes(false);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/api/solicitar-alteracao-email/', { novo_email: novoEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModalEmail(true);
    } catch (error) { alert(error.response?.data?.erro || "Erro ao solicitar troca."); }
  };

  const confirmarEmailFinal = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/api/confirmar-novo-email/', { 
        codigo: codigoEmail, novo_email: novoEmail 
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Email atualizado com sucesso!");
      setShowModalEmail(false);
      setModoEdicaoDetalhes(false);
      fetchUserData();
    } catch (error) { alert("Código inválido."); }
  };

  // --- LÓGICA DE ALTERAÇÃO DE PASSWORD ---
  const manejarAlterarPassword = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/api/alterar-password-2fa/', {
        password_atual: passwordAtual, nova_password: novaPassword, codigo_otp: codigo2FAPassword
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Password alterada!");
      setPasswordAtual(''); setNovaPassword(''); setCodigo2FAPassword('');
    } catch (error) { alert(error.response?.data?.erro || "Erro na password."); }
  };

  // --- LÓGICA DE 2FA ---
  const iniciarAtivacao2FA = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      const resp = await axios.get('http://127.0.0.1:8000/api/gerar-qr-2fa/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCodeUrl(resp.data.qr_code);
      setShowModal2FA(true);
    } catch (err) { alert("Erro ao gerar QR."); }
  };

  const confirmarAtivacao2FA = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/api/confirmar-2fa/', { codigo: codigoAtivacao }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIs2FA(true); setShowModal2FA(false); fetchUserData();
    } catch (err) { alert("Código incorreto."); }
  };

  const guardarSeguranca = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      await axios.post('http://127.0.0.1:8000/api/atualizar-seguranca/', { telemovel, dois_fatores_ativo: is2FA }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Segurança guardada!"); setModoEdicaoSeguranca(false);
    } catch (error) { alert("Erro ao guardar."); }
  };

  if (loading || !userData) return <Layout><div className="def-page-wrapper">A carregar... 🔄</div></Layout>;

  return (
    <Layout>
      <div className="def-page-wrapper">
        <div className="def-header">
          <div className="def-avatar">{userData.iniciais}</div>
          <div><h1>Definições da Conta</h1><p>{userData.email}</p></div>
        </div>

        <div className="def-tabs">
          <button onClick={() => setAbaAtiva('user_settings')} className={`def-tab-btn ${abaAtiva === 'user_settings' ? 'active' : ''}`}>Configurações de Utilizador</button>
        </div>

        {abaAtiva === 'user_settings' && (
          <div className="def-grid">
            <div className="def-col">
              {/* CARD DETALHES (EMAIL EDITÁVEL) */}
              <div className="def-card">
                <div className="def-card-header">
                    <h3>Detalhes</h3>
                    {!modoEdicaoDetalhes ? (
                        <button className="def-btn-edit" onClick={() => setModoEdicaoDetalhes(true)}>✎ Editar</button>
                    ) : (
                        <div style={{display:'flex', gap:'8px'}}>
                            <button className="def-btn-save" onClick={manejarSolicitarEmail}>Validar</button>
                            <button className="def-btn-cancel" onClick={() => setModoEdicaoDetalhes(false)}>Cancelar</button>
                        </div>
                    )}
                </div>
                <div className="def-form-group"><span className="def-label">Nome</span><div className="def-value">{userData.nome}</div></div>
                <div className="def-form-group">
                    <span className="def-label">Email</span>
                    {modoEdicaoDetalhes ? (
                        <input type="email" className="def-input" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
                    ) : (
                        <div className="def-value">{userData.email}</div>
                    )}
                </div>
                <div className="def-form-group"><span className="def-label">Empresa</span><div className="def-value">{userData.empresa}</div></div>
                <div><span className="def-label">ID Suporte</span><div className="def-value-box">{userData.id_utilizador}</div></div>
              </div>

              {/* CARD PASSWORD */}
              <div className="def-card">
                <div className="def-card-header"><h3>Palavra-passe</h3></div>
                <div className="def-form-group"><span className="def-label">*Password Atual</span><input type="password" placeholder="••••••••" className="def-input" value={passwordAtual} onChange={(e) => setPasswordAtual(e.target.value)} /></div>
                <div className="def-form-group"><span className="def-label">*Nova Password</span><input type="password" placeholder="Mínimo 8 caracteres" className="def-input" value={novaPassword} onChange={(e) => setNovaPassword(e.target.value)} /></div>
                {is2FA && (
                    <div className="def-form-group">
                        <span className="def-label" style={{color:'#4f46e5', fontWeight:'bold'}}>*Código Authenticator</span>
                        <input type="text" className="def-input" style={{borderColor:'#4f46e5'}} placeholder="000000" value={codigo2FAPassword} onChange={(e) => setCodigo2FAPassword(e.target.value)} />
                    </div>
                )}
                <button className="def-btn-primary" onClick={manejarAlterarPassword}>Alterar Password</button>
              </div>
            </div>

            <div className="def-col">
              {/* CARD SEGURANÇA */}
              <div className="def-card">
                <div className="def-card-header">
                  <h3>Segurança & Contacto</h3>
                  {!modoEdicaoSeguranca ? (
                    <button className="def-btn-edit" onClick={() => setModoEdicaoSeguranca(true)}>✎ Editar</button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="def-btn-save" onClick={guardarSeguranca}>Gravar</button>
                      <button className="def-btn-cancel" onClick={() => setModoEdicaoSeguranca(false)}>Cancelar</button>
                    </div>
                  )}
                </div>
                <div className="def-form-group">
                  <span className="def-label">Telemóvel</span>
                  {modoEdicaoSeguranca ? <input type="tel" className="def-input" value={telemovel} onChange={(e) => setTelemovel(e.target.value)} /> : <div className="def-value">{userData.telemovel || 'Nenhum associado.'}</div>}
                </div>
                <div className="def-toggle-wrapper">
                  <div className="def-toggle-text"><strong>2FA</strong><span>App de Autenticação.</span></div>
                  <div onClick={() => { if (!modoEdicaoSeguranca) return; if (!is2FA) iniciarAtivacao2FA(); else setIs2FA(false); }} className={`def-toggle ${modoEdicaoSeguranca ? 'editable' : ''} ${is2FA ? 'active' : ''}`}><div className="def-toggle-knob"></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*MODAL EMAIL*/}
        {showModalEmail && (
          <div className="def-modal-overlay">
            <div className="def-modal-card">
              <h2 style={{color: '#4f46e5'}}>Confirmar Novo Email</h2>
              <p>Enviámos um código para <strong>{novoEmail}</strong>. Insira-o abaixo para confirmar a troca.</p>
              <input type="text" maxLength="6" placeholder="000000" className="def-modal-input" value={codigoEmail} onChange={(e) => setCodigoEmail(e.target.value)} />
              <div className="def-modal-actions">
                <button className="def-btn-cancel-modal" onClick={() => setShowModalEmail(false)}>Cancelar</button>
                <button className="def-btn-confirm" onClick={confirmarEmailFinal}>Confirmar Email</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2FA */}
        {showModal2FA && (
          <div className="def-modal-overlay">
            <div className="def-modal-card">
              <h2>Configurar Authenticator</h2>
              <div className="def-qr-box">{qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" /> : "A gerar..."}</div>
              <input type="text" maxLength="6" placeholder="000000" className="def-modal-input" value={codigoAtivacao} onChange={(e) => setCodigoAtivacao(e.target.value)} />
              <div className="def-modal-actions">
                <button className="def-btn-cancel-modal" onClick={() => setShowModal2FA(false)}>Cancelar</button>
                <button className="def-btn-confirm" onClick={confirmarAtivacao2FA}>Ativar Agora</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Definicoes;