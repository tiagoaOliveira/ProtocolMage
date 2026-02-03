import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Backpack, Sparkles, ShoppingCart } from 'lucide-react';
import {
  getAllSkills,
  getUserSkills,
  getAllXPItems,
  getUserXPItems,
  useXPItem,
  listItemOnMarketplace
} from '../services/service';
import SellModal from './SellModal';
import './Inventory.css';
import Toast, { useToast } from './Toast';

export default function InventoryModal({ isOpen, onClose, userId, onUpdate }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('skills');
  const [allSkills, setAllSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [allXPItems, setAllXPItems] = useState([]);
  const [userXPItems, setUserXPItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadInventory();
    }
  }, [isOpen, userId]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [allSkillsData, userSkillsData, allXPItemsData, userXPItemsData] = await Promise.all([
        getAllSkills(),
        getUserSkills(userId),
        getAllXPItems(),
        getUserXPItems(userId)
      ]);
      setAllSkills(allSkillsData || []);
      setUserSkills(userSkillsData || []);
      setAllXPItems(allXPItemsData || []);
      setUserXPItems(userXPItemsData || []);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
    } finally {
      setLoading(false);
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

      showToast('Item listado com sucesso!');
      loadInventory();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao listar item:', error);
      showToast('Erro ao listar item.');
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
              Magias
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
                    {allSkills.length === 0 ? (
                      <p className="inventory-empty">Nenhuma skill cadastrada</p>
                    ) : (
                      allSkills.map((skill) => {
                        const userSkill = userSkills.find(us => us.skill_id === skill.id);
                        const hasSkill = !!userSkill;

                        return (
                          <div key={skill.id} className="inventory-item">
                            <div className='inventory-item-icon'>
                              {skill.image && (
                                <img
                                  src={skill.image}
                                  alt={skill.name}
                                  className="inventory-item-image"
                                />
                              )}
                              <div className="inventory-item-actions">
                                {hasSkill ? (
                                  <button
                                    className="btn-sell"
                                    onClick={() => openSellModal(userSkill, 'skill')}
                                    title="Vender no Mercado"
                                  >
                                    <ShoppingCart size={18} /> Vender
                                  </button>
                                ) : (
                                  <button
                                    className="btn-convert"
                                    onClick={() => {
                                      onClose();
                                      navigate('/mercado');
                                    }}
                                    title="Comprar no Mercado"
                                  >
                                    <ShoppingCart size={18} /> Comprar
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="inventory-item-info">
                              <h3>{skill.name}</h3>
                              <div className="inventory-item-desc">
                                {skill.descricao || 'Sem descrição'}
                                <div className="inventory-item-stats">
                                  {hasSkill && (
                                    <span className="item-quantity">x{userSkill.quantidade}</span>
                                  )}
                                  {skill.cooldown && (
                                    <span style={{ display: 'block', marginTop: '4px', color: '#f09124', fontWeight: 'bold' }}>
                                      Recarga: {skill.cooldown}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'xp_items' && (
                  <div className="inventory-grid">
                    {allXPItems.length === 0 ? (
                      <p className="inventory-empty">Nenhum frasco de XP cadastrado</p>
                    ) : (
                      allXPItems.map((xpItem) => {
                        const userItem = userXPItems.find(ui => ui.item_id === xpItem.id);
                        const hasItem = !!userItem;

                        return (
                          <div key={xpItem.id} className="inventory-item xp-item">
                            <div className="inventory-item-icon">
                              <img
                                src={`${xpItem.xp_image}?v=${xpItem.id}`}
                                alt={xpItem.nome}
                                className="inventory-item-image"
                              />
                              <div className="inventory-item-actions">
                                {hasItem ? (
                                  <>
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
                                      <ShoppingCart size={18} /> Vender
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="btn-convert"
                                    onClick={() => {
                                      onClose();
                                      navigate('/mercado');
                                    }}
                                    title="Comprar no Mercado"
                                  >
                                    <ShoppingCart size={18} /> Comprar
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="inventory-item-info">
                              <h3>{xpItem.nome}</h3>
                              <div className="inventory-item-stats">
                                {hasItem && (
                                  <span className="item-quantity">x{userItem.quantidade}</span>
                                )}
                                <span className="item-xp-large">+{xpItem.xp} XP</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
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
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}