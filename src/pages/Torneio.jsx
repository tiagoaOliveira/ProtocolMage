import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import './Torneio.css';

const Torneio = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="torneio-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="torneio-container">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="torneio-content">
        <div className="torneio-list">
          <div className='torneio-header'>Sua pontuação</div>
          <div className='torneio-torneio'></div>
        </div>

        <div className="nav-menu">
          <Nav />
        </div>
      </main>
    </div>
  );
};

export default Torneio;