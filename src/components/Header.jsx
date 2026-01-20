import React, { useState } from 'react';
import './Header.css';
import ChancesModal from './Chances';

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header-info">
          <h2>Informações</h2>
          <button className="modal-close-info" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p> Nada de Pay To Win, nada de indicados só para criadores de conteúdos ganharem, nem horas em frente ao pc para ganhar centavos.</p>
          <p> Minha ideia com esse projeto é ser algo simples, que não tome tempo, talvez como forma de investimento/passatempo.</p>
          <p>Não tem a pretensão de ser um Ragnarok ou Axie Infinity, apenas um farm fácil, torneios rápidos, preços acessíveis...</p>
        </div>
      </div>
    </>
  );
};

const Header = ({ userData, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChances, setShowChances] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const nivel = userData?.nivel ?? 1;
  const xp = userData?.xp ?? 0;

  const xpMinNivel = nivel * nivel * 100;
  const xpProxNivel = (nivel + 1) * (nivel + 1) * 100;

  const xpNoNivel = xp - xpMinNivel;
  const xpTotalNivel = xpProxNivel - xpMinNivel;

  const xpPercent = nivel >= 60
    ? 100
    : Math.min(100, Math.max(0, (xpNoNivel / xpTotalNivel) * 100));

  return (
    <header className="header">
      <div className="header-avatar">
        <div className="avatar-container">
          {userData?.avatar ? (
            <img src={userData.avatar} alt="Avatar" className="avatar" />
          ) : (
            <div></div>
          )}
        </div>
      </div>

      <div className='header-menu'>
        <div className="header-infos">
          <div className="user-infos">
            <div className="user-name">
              {userData?.nome || 'Usuário'}
            </div>
            <div className="user-money">
              <p>R$: {userData?.saldo ?? 0}</p>
            </div>
          </div>
          <div className="header-level">
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            <h4 className="user-level">
              Nvl {nivel}
            </h4>
          </div>
        </div>

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={toggleMenu}></div>
          <div className="menu-dropdown">
            <button 
              className="menu-item"
              onClick={() => setShowInfo(true)}
            >
              Info
            </button>
            <button
              className='chances-button menu-item'
              onClick={() => setShowChances(true)}
              title="Ver Chances"
            >
              <p>Probabilidades</p>
            </button>
            <div className='versao-sair'>
              <button onClick={onLogout} className="menu-item logout">
                Sair
              </button>
              <p className='versao menu-item'>Versão 1.00</p>
            </div>
          </div>
        </>
      )}

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      <ChancesModal isOpen={showChances} onClose={() => setShowChances(false)} />
    </header>
  );
};

export default Header;