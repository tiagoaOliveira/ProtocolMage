import { useState, useEffect } from 'react';
import { X, Star, Backpack, Sparkles, TrendingUp, ShoppingCart } from 'lucide-react';
import {
  getUserSkills,
  getUserXPItems,
  useXPItem,
  convertSkillToXP,
  toggleSkillEquipped,
  listItemOnMarketplace
} from '../services/service';
import SellModal from './SellModal';
import './Inventory.css';

export default function InventoryModal({ isOpen, onClose, userId, onUpdate }) {
  const [activeTab, setActiveTab] = useState('skills');
  const [skills, setSkills] = useState([]);
  const [xpItems, setXpItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados do modal de venda
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadInventory();
    }
  }, [isOpen, userId]);

  const sortedXpItems = [...xpItems].sort(
    (a, b) => a.item.id - b.item.id
  );

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [skillsData, xpItemsData] = await Promise.all([
        getUserSkills(userId),
        getUserXPItems(userId)
      ]);
      setSkills(skillsData || []);
      setXpItems(xpItemsData || []);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEquip = async (skillId, currentSlot) => {
    try {
      if (currentSlot !== null) {
        await toggleSkillEquipped(userId, skillId, null);
      } else {
        const equippedSkills = skills.filter(s => s.slot !== null);
        const occupiedSlots = equippedSkills.map(s => s.slot);

        let nextSlot = null;
        for (let i = 1; i <= 6; i++) {
          if (!occupiedSlots.includes(i)) {
            nextSlot = i;
            break;
          }
        }

        if (nextSlot === null) {
          alert('Todos os slots estão ocupados. Desequipe uma skill primeiro.');
          return;
        }

        await toggleSkillEquipped(userId, skillId, nextSlot);
      }

      loadInventory();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao equipar/desequipar:', error);
      alert(error.message || 'Erro ao equipar skill');
    }
  };

  const handleUseXPItem = async (itemId, quantidade = 1) => {
    try {
      await useXPItem(userId, itemId, quantidade);
      loadInventory();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao usar item:', error);
    }
  };

  const handleConvertSkill = async (skillId) => {
    if (!confirm('Tem certeza que deseja converter esta skill em XP?')) return;

    try {
      await convertSkillToXP(userId, skillId, 1);
      loadInventory();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao converter skill:', error);
    }
  };

  const openSellModal = (item, itemType) => {
    setSelectedItem(item);
    setSelectedItemType(itemType);
    setSellModalOpen(true);
  };

  const handleSellConfirm = async (quantidade, preco) => {
    try {
      const itemId = selectedItemType === 'skill'
        ? selectedItem.skill_id
        : selectedItem.item_id;

      await listItemOnMarketplace(
        userId,
        selectedItemType,
        itemId,
        quantidade,
        preco
      );

      alert('Item listado no marketplace com sucesso!');
      loadInventory();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao listar item:', error);
      alert('Erro ao listar item no marketplace');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="inventory-modal-overlay" onClick={onClose}>
        <div className="inventory-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="inventory-modal-close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="inventory-header">
            <Backpack size={32} />
            <h2>Inventário</h2>
          </div>

          <div className="inventory-tabs">
            <button
              className={`inventory-tab ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <Sparkles size={20} />
              Habilidades
            </button>
            <button
              className={`inventory-tab ${activeTab === 'xp_items' ? 'active' : ''}`}
              onClick={() => setActiveTab('xp_items')}
            >
              <Star size={20} />
              Frascos de XP
            </button>
          </div>

          <div className="inventory-body">
            {loading ? (
              <div className="inventory-loading">Carregando...</div>
            ) : (
              <>
                {activeTab === 'skills' && (
                  <div className="inventory-grid">
                    {skills.length === 0 ? (
                      <p className="inventory-empty">Nenhuma skill no inventário</p>
                    ) : (
                      skills.map((userSkill) => (
                        <div key={userSkill.id} className="inventory-item">
                          <div className='inventory-item-icon'>
                            {userSkill.skill.image && (
                              <img
                                src={userSkill.skill.image}
                                alt={userSkill.skill.name}
                                className="inventory-item-image"
                              />
                            )}
                            <div className="inventory-item-actions">
                              <button
                                className={`btn-equip ${userSkill.slot !== null ? 'equipped' : ''}`}
                                onClick={() => handleToggleEquip(userSkill.skill_id, userSkill.slot)}
                              >
                                {userSkill.slot !== null ? 'Desequipar' : 'Equipar'}
                              </button>
                              <button
                                className="btn-convert"
                                onClick={() => handleConvertSkill(userSkill.skill_id)}
                                title="Converter em XP"
                              >
                                <TrendingUp size={18} />
                              </button>
                              <button
                                className="btn-sell"
                                onClick={() => openSellModal(userSkill, 'skill')}
                                title="Vender no Marketplace"
                              >
                                <ShoppingCart size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="inventory-item-info">
                            <h3>{userSkill.skill.name}</h3>
                            <p className="inventory-item-desc">
                              {userSkill.skill.descricao || 'Sem descrição'}
                            </p>
                            <div className="inventory-item-stats">
                              <span className="item-quantity">x{userSkill.quantidade}</span>
                              {userSkill.slot !== null && (
                              <span className="item-equipped">✓ Equipada (Slot {userSkill.slot})</span>
                            )}
                              <span className="item-xp">{userSkill.skill.xp_skill} XP</span>
                            </div>
                            
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'xp_items' && (
                  <div className="inventory-grid">
                    {xpItems.length === 0 ? (
                      <p className="inventory-empty">Nenhum frasco de XP no inventário</p>
                    ) : (
                      sortedXpItems.map((userItem) => (
                        <div key={userItem.item.id} className="inventory-item xp-item">
                          <div className="inventory-item-icon">
                            <img
                              src={`${userItem.item.xp_image}?v=${userItem.item.id}`}
                              alt={userItem.item.nome}
                              className="inventory-item-image"
                            />
                            <div className="inventory-item-actions">
                              <button
                                className="btn-use"
                                onClick={() => handleUseXPItem(userItem.item_id, 1)}
                              >
                                Usar x1
                              </button>

                              <button
                                className="btn-use"
                                onClick={() => handleUseXPItem(userItem.item_id, 10)}
                              >
                                Usar x10
                              </button>

                              <button
                                className="btn-sell"
                                onClick={() => openSellModal(userItem, 'xp_item')}
                                title="Vender no Marketplace"
                              >
                                <ShoppingCart size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="inventory-item-info">
                            <h3>{userItem.item.nome}</h3>
                            <div className="inventory-item-stats">
                              <span className="item-quantity">x{userItem.quantidade}</span>
                              <span className="item-xp-large">+{userItem.item.xp} XP</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <SellModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        item={selectedItem}
        itemType={selectedItemType}
        onConfirm={handleSellConfirm}
      />
    </>
  );
}