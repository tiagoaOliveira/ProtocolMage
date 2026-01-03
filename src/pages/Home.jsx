import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, generateLoot, getEquippedSkills } from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import CharacterModal from '../components/Character';
import InventoryModal from '../components/Inventory';
import { Backpack, Sparkles, Star, Percent } from 'lucide-react';
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
  const [fighting, setFighting] = useState(false);
  const [lootNotification, setLootNotification] = useState(null);
  const [equippedSkills, setEquippedSkills] = useState([]);

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
    if (fighting) return;

    setFighting(true);

    setTimeout(async () => {
      try {
        const loot = await generateLoot(user.id);

        const updatedData = await getUserById(user.id);
        setUserData(updatedData);

        setLootNotification(loot.items); // abre o modal
      } catch (error) {
        console.error('Erro ao gerar loot:', error);
        alert('Erro ao gerar loot');
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


  return (
    <div className="home-container">
      <Header userData={userData} onLogout={handleLogout} />

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
            disabled={fighting}
          >
            {fighting ? (
              <>
                <Sparkles className="spin-icon" size={24} />
                Lutando...
              </>
            ) : (
              'INICIAR FARM'
            )}
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

        <div className="nav-menu">
          <Nav />
        </div>
      </main>
    </div>
  );
};

export default Home;