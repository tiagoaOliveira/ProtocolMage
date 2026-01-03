import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, iniciarBatalha, getRanking } from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import BattleLog from '../components/BattleLog';
import './Torneio.css';

const Torneio = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batalhaAtiva, setBatalhaAtiva] = useState(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [data, rankingData] = await Promise.all([
            getUserById(user.id),
            getRanking(20)
          ]);
          setUserData(data);
          setRanking(rankingData);
        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleDesafiar = async (oponenteId) => {
    if (oponenteId === user.id) {
      alert('Você não pode desafiar a si mesmo!');
      return;
    }

    setProcessando(true);
    try {
      const resultado = await iniciarBatalha(user.id, oponenteId);
      setBatalhaAtiva(resultado.batalha);
    } catch (error) {
      console.error('Erro ao iniciar batalha:', error);
      alert('Erro ao iniciar batalha. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  };

  const fecharBatalha = () => {
    setBatalhaAtiva(null);
    getRanking(20).then(setRanking);
  };

  if (loading) {
    return (
      <div className="torneio-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  const posicaoUsuario = ranking.findIndex(r => r.id === user.id) + 1;
  const vitoriasUsuario = ranking.find(r => r.id === user.id)?.vitorias || 0;

  return (
    <div className="torneio-container">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="torneio-content">
        <div className="ranking-section">
          <h2 className="ranking-title">🏆 EM BREVE!!!</h2>
          
          {processando && (
            <div className="processing-overlay">
              <div className="spinner"></div>
              <p>Iniciando batalha...</p>
            </div>
          )}

          <div className="ranking-list">
            {ranking.map((jogador, index) => (
              <div 
                key={jogador.id} 
                className={`ranking-item ${jogador.id === user.id ? 'user-item' : ''}`}
              >
                <div className="ranking-position">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                
                <div className="ranking-info">
                  <h3>{jogador.nome}</h3>
                  <div className="ranking-details">
                    <span>Nível {jogador.nivel}</span>
                    <span>•</span>
                    <span>{jogador.vitorias} vitórias</span>
                  </div>
                </div>

                {jogador.id !== user.id && (
                  <button 
                    className="btn-desafiar"
                    onClick={() => handleDesafiar(jogador.id)}
                    disabled={processando}
                  >
                    ⚔️ Desafiar
                  </button>
                )}

                {jogador.id === user.id && (
                  <span className="user-badge">Você</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="nav-menu">
          <Nav />
        </div>
      </main>

      {batalhaAtiva && (
        <BattleLog
          logTurnos={batalhaAtiva.log_turnos}
          nome={userData?.nome}
          oponenteName={ranking.find(r => r.id === batalhaAtiva.oponente_id)?.nome}
          onClose={fecharBatalha}
        />
      )}
    </div>
  );
};

export default Torneio;