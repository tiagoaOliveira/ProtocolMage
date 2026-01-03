import React, { useState } from 'react';
import './Header.css';
import ChancesModal from './Chances';

const Header = ({ userData, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChances, setShowChances] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const nivel = userData?.nivel ?? 1
  const xp = userData?.xp ?? 0

  const xpMinNivel = nivel * nivel * 100
  const xpProxNivel = (nivel + 1) * (nivel + 1) * 100

  const xpNoNivel = xp - xpMinNivel
  const xpTotalNivel = xpProxNivel - xpMinNivel

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
            <button className="menu-item">Info</button>
            <ChancesModal isOpen={showChances}
              onClose={() => setShowChances(false)}
            />
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
              <p className='versao menu-item'>Versão 1.00</p></div>
          </div>
        </>
      )}

    </header >
  );
};

export default Header;
