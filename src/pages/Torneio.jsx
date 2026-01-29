import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserById,
  obterTorneioAtual,
  inscreverTorneio,
  cancelarInscricaoTorneio,
  listarTiposTorneio,
  processarTorneio,
  obterHistoricoBatalhas
} from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Logview from '../components/Logview';
import HistoricoSimples from '../components/HistoricoSimples';
import './Torneio.css';
import Toast, { useToast } from '../components/Toast';

const Torneio = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  const [torneioData, setTorneioData] = useState(null);
  const [tiposTorneio, setTiposTorneio] = useState([]);
  const [batalhando, setBatalhando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [showBattleLog, setShowBattleLog] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // Estados para histórico
  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoBatalhas, setHistoricoBatalhas] = useState([]);
  const [logSelecionado, setLogSelecionado] = useState(null);
  const [oponenteSelecionado, setOponenteSelecionado] = useState(null);

  const fetchTorneioData = async (silencioso = false) => {
    try {
      const torneioResult = await obterTorneioAtual(user.id, false);

      if (torneioResult.success) {
        const status = torneioResult.torneio.status;

        setTorneioData(torneioResult);

        if (status === 'processando' && !batalhando) {
          setBatalhando(true);

          try {
            await processarTorneio(torneioResult.torneio.id);
          } catch (error) {
            console.error('Erro ao processar torneio:', error);
            showToast('Erro ao processar batalha', 'error');
            setBatalhando(false);
          }
        }
      } else {
        if (!silencioso) {
          setTorneioData(null);
        }
      }
    } catch (error) {
      if (!silencioso) {
        console.error('Erro ao buscar torneio:', error);
        setTorneioData(null);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [userDataResult, tiposResult] = await Promise.all([
          getUserById(user.id),
          listarTiposTorneio()
        ]);

        setUserData(userDataResult);
        setTiposTorneio(tiposResult);

        await fetchTorneioData(true);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!torneioData ||
      torneioData.torneio.status === 'finalizado' ||
      !batalhando) {
      return;
    }

    const interval = setInterval(async () => {
      const result = await obterTorneioAtual(user.id, true);
      if (result.success && result.torneio.status === 'finalizado') {
        setBatalhando(false);
        setTorneioData(result);
        setMostrarResultado(true);

        const newUserData = await getUserById(user.id);
        setUserData(newUserData);

        showToast('Batalha finalizada!', 'success');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [torneioData, batalhando]);

  const handleInscrever = async (tipoTorneioId) => {
    try {
      const result = await inscreverTorneio(user.id, tipoTorneioId);

      if (result.success) {
        showToast('Inscrição realizada!', 'success');

        const [newUserData] = await Promise.all([
          getUserById(user.id)
        ]);

        setUserData(newUserData);
        await fetchTorneioData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      showToast('Erro ao inscrever', 'error');
    }
  };

  const handleCancelar = async () => {
    if (cancelando) return;

    setCancelando(true);
    try {
      const result = await cancelarInscricaoTorneio(user.id);

      if (result.success) {
        showToast('Inscrição cancelada', 'success');

        const newUserData = await getUserById(user.id);
        setUserData(newUserData);
        setTorneioData(null);
        setMostrarResultado(false);
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      showToast('Erro ao cancelar', 'error');
    } finally {
      setCancelando(false);
    }
  };

  const handleVoltarLista = () => {
    setTorneioData(null);
    setMostrarResultado(false);
    setBatalhando(false);
  };

  const handleAbrirHistorico = async () => {
    try {
      const historico = await obterHistoricoBatalhas(user.id);
      setHistoricoBatalhas(historico);
      setShowHistorico(true);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      showToast('Erro ao carregar histórico', 'error');
    }
  };

  const handleVerLogHistorico = (log, oponente) => {
    setLogSelecionado(log);
    setOponenteSelecionado(oponente);
    setShowHistorico(false);
    setShowBattleLog(true);
  };

  const handleFecharLog = () => {
    setShowBattleLog(false);
    setLogSelecionado(null);
    setOponenteSelecionado(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getAvatarDisplay = (avatarUrl) => {
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('/'))) {
      return <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return avatarUrl || '⚔️';
  };

  if (loading) {
    return (
      <div className="torneio-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  const emTorneioAguardando = torneioData && torneioData.torneio.status === 'aguardando' && !torneioData.oponente;
  const exibirResultado = mostrarResultado || (torneioData && torneioData.torneio.status === 'finalizado');

  return (
    <div className="torneio-container">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="torneio-content">
        {!torneioData && !mostrarResultado && (
          <>
            <div className="torneios-header">
              <h1>Torneios 1 Contra 1
              </h1>
              <button onClick={handleAbrirHistorico} className="btn-historico">
                📜
              </button>

            </div>

            <div className="torneios-lista">
              {tiposTorneio.map(tipo => (
                <div key={tipo.id} className="torneio-card">
                  <div className="torneio-card-header">
                    <h3>🏆 Prêmio: {tipo.premio_vencedor.toFixed(2)}</h3>
                    <div className="torneio-card-taxa">R$ {tipo.taxa_inscricao.toFixed(2)}</div>
                  </div>

                  <p className="torneio-card-desc">{tipo.descricao}</p>

                  <button
                    onClick={() => handleInscrever(tipo.id)}
                    className="btn-inscrever-card"
                    disabled={userData.saldo < tipo.taxa_inscricao}
                  >
                    {userData.saldo < tipo.taxa_inscricao ? 'Saldo Insuficiente' : 'Lutar'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {emTorneioAguardando && (
          <div className="torneio-aguardando">
            <div className="aguardando-icon">⏳</div>
            <h2>Aguardando oponente...</h2>
            <p className="aguardando-info">Esperando outro jogador.</p>

            {torneioData.torneio.pode_cancelar && (
              <button
                onClick={handleCancelar}
                className="btn-cancelar"
                disabled={cancelando}
              >
                {cancelando ? 'Cancelando...' : 'Cancelar Inscrição'}
              </button>
            )}
          </div>
        )}

        {batalhando && (
          <div className="torneio-batalhando">
            <div className="batalhando-icon">⚔️</div>
            <h2>Batalha em andamento...</h2>
            <p className="batalhando-info">Processando resultado...</p>
          </div>
        )}

        {exibirResultado && torneioData && torneioData.oponente && (
          <div className="torneio-finalizado">
            <div className="versus-container">
              <div className={`player-card ${torneioData.torneio.vencedor_id === user.id ? 'vencedor' : 'perdedor'}`}>
                <div className="player-avatar-big">{getAvatarDisplay(userData.avatar)}</div>
                <div className="player-name">{userData.nome}</div>
                <div className="player-level">Nível {userData.nivel}</div>
                {torneioData.torneio.vencedor_id === user.id && (
                  <div className="badge-vencedor">🏆 VENCEDOR</div>
                )}
              </div>
              <div className="versus-text">VS</div>

              <div className={`player-card ${torneioData.torneio.vencedor_id === torneioData.oponente.id ? 'vencedor' : 'perdedor'}`}>
                <div className="player-avatar-big">{getAvatarDisplay(torneioData.oponente.avatar)}</div>
                <div className="player-name">{torneioData.oponente.nome}</div>
                <div className="player-level">Nível {torneioData.oponente.nivel}</div>
                {torneioData.torneio.vencedor_id === torneioData.oponente.id && (
                  <div className="badge-vencedor">🏆 VENCEDOR</div>
                )}
              </div>
            </div>

            <div className="premio-info">
              <div className="premio-icon">
                {torneioData.torneio.vencedor_id === user.id ? '🎉' : '💀'}
              </div>
              <div className="premio-text">
                {torneioData.torneio.vencedor_id === user.id ? (
                  <>Você ganhou <strong>{torneioData.torneio.premio_vencedor.toFixed(2)}</strong>!</>
                ) : (
                  <>Você perdeu</>
                )}
              </div>
            </div>

            <div className="acoes-finalizado">
              <button onClick={() => setShowBattleLog(true)} className="btn-ver-log">
                📜 Ver Log da Batalha
              </button>
              <button onClick={handleVoltarLista} className="btn-voltar">
                ← Voltar
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="nav-menu">
        <Nav />
      </div>

      {showBattleLog && (logSelecionado || torneioData?.torneio?.log) && (
        <Logview
          logTurnos={logSelecionado || torneioData.torneio.log}
          userName={userData.nome}
          oponenteName={oponenteSelecionado?.nome || torneioData.oponente?.nome || 'Oponente'}
          onClose={handleFecharLog}
        />
      )}

      {showHistorico && (
        <HistoricoSimples
          historico={historicoBatalhas}
          userId={user.id}
          onClose={() => setShowHistorico(false)}
          onVerLog={handleVerLogHistorico}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Torneio;