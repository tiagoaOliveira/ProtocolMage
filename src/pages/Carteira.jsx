import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import './Carteira.css';
import BattleLog from '../components/Logview';

const Carteira = () => {
  const [mostrarLog, setMostrarLog] = useState(false);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valor, setValor] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const data = await getUserById(user.id);
          setUserData(data);
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const depositar = () => {
    if (valor > 0) {
      // Aqui você pode adicionar a lógica para atualizar o saldo no banco
      console.log('Depositar:', valor);
      setValor("");
    }
  };

  if (loading) {
    return (
      <div className="carteira-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="carteira-container">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="carteira-content">
        <div className="carteira-card">
          <h2>💰 Carteira</h2>

          <div className="saldo">
            Saldo: <span>R$ {(userData?.saldo ?? 0).toFixed(2)}</span>
          </div>

          <input
            type="number"
            placeholder="Valor do depósito"
            className="carteira-input"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <button
            className="depositar-btn"
            onClick={() => setMostrarLog(true)}
          >
            📜 Ver Log da Batalha
          </button>

        </div>

        <div className="nav-menu">
          <Nav />
        </div>
      </main>
      {mostrarLog && (
        <BattleLog
          userName={userData?.nome ?? 'Jogador'}
          oponenteName="Oponente"
          onClose={() => setMostrarLog(false)}
        />
      )}


    </div>
  );
};

export default Carteira;