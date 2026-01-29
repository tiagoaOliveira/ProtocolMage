import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, getEquippedSkills, generateDailyLoot, checkDailyLootStatus } from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import CharacterModal from '../components/Character';
import InventoryModal from '../components/Inventory';
import InfoModal from '../components/InfoModal'; // ADICIONAR ESTA LINHA
import Toast, { useToast } from '../components/Toast';
import { Backpack, Sparkles, Star, Clock, ShieldQuestionMark } from 'lucide-react'; // ADICIONAR Info
import './Home.css';
import mageperfil from '../assets/mage-perfil.png'
import mage from '../assets/mage.png'

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false); // ADICIONAR ESTA LINHA
  const [fighting, setFighting] = useState(false);
  const [lootNotification, setLootNotification] = useState(null);
  const [equippedSkills, setEquippedSkills] = useState([]);
  const [lootStatus, setLootStatus] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const { toasts, showToast, removeToast } = useToast();

  // Verificar status do loot ao carregar
  useEffect(() => {
    const fetchLootStatus = async () => {
      if (!user) return;

      try {
        const status = await checkDailyLootStatus(user.id);
        setLootStatus(status);
      } catch (error) {
        console.error('Erro ao verificar status do loot:', error);
      }
    };

    fetchLootStatus();
    const interval = setInterval(fetchLootStatus, 60000); // Atualizar a cada 1 minuto

    return () => clearInterval(interval);
  }, [user]);

  // Calcular tempo restante
  useEffect(() => {
    if (!lootStatus?.next_available_at) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const nextAvailable = new Date(lootStatus.next_available_at);
      const diff = nextAvailable - now;

      if (diff <= 0) {
        setTimeRemaining('DISPONÍVEL');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lootStatus?.next_available_at]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const data = await getUserById(user.id);
        setUserData(data);

        // Carregar skills equipadas
        const equipped = await getEquippedSkills(user.id);
        setEquippedSkills(equipped || []);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleFight = async () => {
    if (fighting || !lootStatus?.can_claim) return;

    setFighting(true);

    setTimeout(async () => {
      try {
        const loot = await generateDailyLoot(user.id);

        const updatedData = await getUserById(user.id);
        setUserData(updatedData);

        // Atualizar status do loot
        const newStatus = await checkDailyLootStatus(user.id);
        setLootStatus(newStatus);

        setLootNotification(loot.items);
        showToast('Loot coletado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao gerar loot:', error);

        if (error.message?.includes('já coletado')) {
          showToast('Você já pegou seu loot diário!', 'warning');
        } else {
          showToast('Erro ao gerar loot', 'error');
        }
      } finally {
        setFighting(false);
      }
    }, 100);
  };

  const handleUserUpdate = async () => {
    try {
      const data = await getUserById(user.id);
      setUserData(data);

      // Recarregar skills equipadas
      const equipped = await getEquippedSkills(user.id);
      setEquippedSkills(equipped || []);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  const handleOpenInventory = () => {
    setCharacterModalOpen(false);
    setInventoryModalOpen(true);
  };

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
      <div className="home-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  const groupLootItems = (items) => {
    const grouped = {};

    items.forEach((item) => {
      const key = `${item.item_type}_${item.item_id}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...item,
          quantity: 1
        };
      } else {
        grouped[key].quantity += 1;
      }
    });

    return Object.values(grouped);
  };

  const getButtonContent = () => {
    if (fighting) {
      return (
        <>
          <Sparkles className="spin-icon" size={24} />
          Lutando...
        </>
      );
    }

    if (lootStatus?.can_claim) {
      return 'Pegar Itens';
    }

    return (
      <>
        <div className='fight-button-cd'>
          <Clock size={20} />
          {timeRemaining || 'Carregando...'}
        </div>
      </>
    );
  };

  return (
    <div className="home-container">
      <Header userData={userData} onLogout={handleLogout} />
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ADICIONAR ESTE BOTÃO FLUTUANTE PARA ABRIR O MODAL DE INFO */}
      <button 
        className="info-floating-button"
        onClick={() => setInfoModalOpen(true)}
        title="Informações"
      >
        <ShieldQuestionMark size={36} color='#ff9800' />
      </button>

      <main className="home-content">
        <div className='fight'>
          <button
            className='character-stats side-button'
            onClick={() => setCharacterModalOpen(true)}
          >
            <img src={mageperfil} alt="" />
          </button>

          <button
            className='fight-button'
            onClick={handleFight}
            disabled={fighting || !lootStatus?.can_claim}
          >
            {getButtonContent()}
          </button>

          <button
            className='side-button'
            onClick={() => setInventoryModalOpen(true)}
          >
            <Backpack color='#f09124' size={60} />
          </button>
        </div>

        {/* Modal de Loot */}
        {lootNotification && (
          <div className="loot-modal-overlay" onClick={() => setLootNotification(null)}>
            <div className="loot-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="loot-items-grid">
                {groupLootItems(lootNotification).map((item, index) => (
                  <div key={index} className="loot-item-card">
                    {item.quantity > 1 && (
                      <span className="loot-item-quantity">
                        x{item.quantity}
                      </span>
                    )}

                    {item.item_image || item.item_xp_image ? (
                      <img
                        src={item.item_image || item.item_xp_image}
                        alt={item.item_name}
                        className="loot-item-image"
                      />
                    ) : (
                      <Star size={48} color="#FFD700" fill="#FFD700" />
                    )}

                    <h3 className="loot-item-name">{item.item_name}</h3>
                  </div>
                ))}
              </div>

              <button
                className="loot-modal-confirm"
                onClick={() => setLootNotification(null)}
              >
                Coletar
              </button>
            </div>
          </div>
        )}

        <CharacterModal
          isOpen={characterModalOpen}
          onClose={() => setCharacterModalOpen(false)}
          equippedSkills={equippedSkills}
          onSkillClick={handleOpenInventory}
          onUpdate={handleUserUpdate}
          userData={userData}
        >
          <img
            src={mage}
            alt="Character"
            className="character-modal-image"
          />
        </CharacterModal>

        <InventoryModal
          isOpen={inventoryModalOpen}
          onClose={() => setInventoryModalOpen(false)}
          userId={user?.id}
          onUpdate={handleUserUpdate}
        />

        {/* ADICIONAR O INFOMODAL AQUI */}
        <InfoModal 
          isOpen={infoModalOpen} 
          onClose={() => setInfoModalOpen(false)} 
        />

        <div className="nav-menu">
          <Nav />
        </div>
      </main>
    </div>
  );
};

export default Home;