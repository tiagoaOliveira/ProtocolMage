import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserById,
  getMarketplaceListings,
  buyFromMarketplace,
  getUserListings,
  cancelMarketplaceListing
} from '../services/service';
import Header from '../components/Header';
import Nav from '../components/Nav';
import './Mercado.css';
import Toast, { useToast } from '../components/Toast';
import ConfirmModal, { useConfirm } from '../components/ConfirmModal';

const Mercado = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const { toasts, showToast, removeToast } = useToast();
  const { confirmState, showConfirm } = useConfirm();

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

  useEffect(() => {
    if (user) {
      loadMarketplace();
      loadMyListings();
    }
  }, [user, selectedFilter]);

  const loadMarketplace = async () => {
    try {
      const data = await getMarketplaceListings(selectedFilter);
      setListings(data.slice(0, 6));
    } catch (error) {
      console.error('Erro ao carregar marketplace:', error);
    }
  };

  const loadMyListings = async () => {
    try {
      const data = await getUserListings(user.id);
      setMyListings(data);
    } catch (error) {
      console.error('Erro ao carregar meus anúncios:', error);
    }
  };

  const handleBuy = async (listingId) => {
    const confirmed = await showConfirm({
      title: 'Confirmar compra?',
      confirmText: 'Comprar',
      type: 'warning'
    });

    if (!confirmed) return;

    try {
      await buyFromMarketplace(user.id, listingId);
      showToast('Item comprado com sucesso!', 'success');
      loadMarketplace();
      const updatedData = await getUserById(user.id);
      setUserData(updatedData);
    } catch (error) {
      console.error('Erro ao comprar:', error);
      showToast(error.message || 'Erro ao comprar item', 'error');
    }
  };

  const handleCancelListing = async (listingId) => {
    const confirmed = await showConfirm({
      title: 'Cancelar anúncio?',
      confirmText: 'Cancelar',
      cancelText: 'Voltar',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await cancelMarketplaceListing(user.id, listingId);
      showToast('Anúncio cancelado com sucesso!', 'success');
      loadMyListings();
      loadMarketplace();
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      showToast('Erro ao cancelar anúncio', 'error');
    }
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
      <div className="mercado-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  const displayListings = selectedFilter === 'my_listings'
    ? myListings.filter(l => l.status === 'ativa')
    : listings;

  return (
    <div className="mercado-container">
      <Header userData={userData} onLogout={handleLogout} />

      <main className="mercado-content">
        <div className="mercado-area">
          <aside className="mercado-sidebar">
            <div className="categoria">
              <button onClick={() => setSelectedFilter('skill')}>
                Habilidades
              </button>
            </div>

            <div className="categoria">
              <button onClick={() => setSelectedFilter('xp_item')}>
                Frascos de XP
              </button>
            </div>

            <div className="categoria">
              <button onClick={() => setSelectedFilter('my_listings')}>
                Meus Anúncios
              </button>
            </div>
          </aside>

          <section className="mercado-list">
            <div className="itens-grid">
              {displayListings.length === 0 ? (
                <p className="empty-message">
                  {selectedFilter === 'my_listings'
                    ? 'Você não tem anúncios ativos'
                    : 'Nenhum item disponível no momento'}
                </p>
              ) : (
                displayListings.map((listing) => (
                  <div key={listing.id} className="item-card">
                    <div className="item-card-info">
                      <div className='item-card-header'>
                        {listing.item_details?.image && (
                        <img
                          src={listing.item_details.image}
                          alt={listing.item_details?.name || listing.item_details?.nome}
                          className="item-card-image"
                        />
                      )}
                      <h3 className="item-card-title">
                        {listing.item_details?.name || listing.item_details?.nome || `Item ID: ${listing.item_id}`}
                      </h3>
                      </div>
                      {selectedFilter !== 'my_listings' && (
                        <p className="item-card-seller">
                          Vendedor: {listing.seller?.nome}
                        </p>
                      )}
                      <p className="item-card-quantity">
                        Quantidade: {listing.quantidade}
                      </p>

                    </div>

                    <div className="item-card-compra">
                      <strong>R$ {parseFloat(listing.preco).toFixed(2)}</strong>
                      {selectedFilter === 'my_listings' ? (
                        <button onClick={() => handleCancelListing(listing.id)}>
                          Cancelar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(listing.id)}
                          disabled={listing.seller_id === user?.id}
                          className={listing.seller_id === user?.id ? 'disabled' : ''}
                        >
                          {listing.seller_id === user?.id ? 'Seu item' : 'Comprar'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="nav-menu">
          <Nav />
        </div>

      </main>
      <Toast toasts={toasts} onRemove={removeToast} />
      <ConfirmModal {...confirmState} />
    </div>

  );

};

export default Mercado;