import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById } from '../services/service'; // Mantido apenas o essencial do usuário
import Header from '../components/Header';
import Nav from '../components/Nav';
import './Torneio.css';
import Toast, { useToast } from '../components/Toast';

const Torneio = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const data = await getUserById(user.id);
        setUserData(data);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
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
        <div className="torneio-title-wrapper">
          <h1 className="torneio-title">🏆 Torneios</h1>
        </div>
        
        <div className="torneios-grid">
          <div className="torneio-card">
            <div className="torneio-card-header">
              <h2>Torneio Principal</h2>
              <div className="torneio-pot">Em breve novas disputas!</div>
            </div>
            
            <div className="torneio-card-body">
              <p style={{color: 'white', textAlign: 'center'}}>
                As inscrições estão temporariamente fechadas.
              </p>
              <button className="btn-inscrever" disabled>
                Indisponível
              </button>
            </div>
          </div>
        </div>

        <div className="nav-menu">
          <Nav />
        </div>
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Torneio;