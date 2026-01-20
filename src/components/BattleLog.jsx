import React from 'react';
import './BattleLog.css';

const BattleLog = ({ logTurnos, userName, oponenteName, vencedorId, userId, onClose, pontosGanhos }) => {
  if (!logTurnos || logTurnos.length === 0) {
    return (
      <div className="battle-log-overlay" onClick={onClose}>
        <div className="battle-log-container" onClick={e => e.stopPropagation()}>
          <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '1.2rem' }}>
            Nenhum log de batalha disponível
          </p>
          <button onClick={onClose} className="btn-close">Fechar</button>
        </div>
      </div>
    );
  }

  const vitoria = vencedorId === userId;  // USAR IDS AO INVÉS DE NOMES
  const vencedor = vitoria ? userName : oponenteName;

  return (
    <div className="battle-log-overlay" onClick={onClose}>
      <div className="battle-log-container simple-result" onClick={e => e.stopPropagation()}>
        
        <div className="battle-result-simple">
          <h1 className={`result-title ${vitoria ? 'victory' : 'defeat'}`}>
            {vitoria ? '🎉 VITÓRIA!' : '💀 DERROTA'}
          </h1>
          
          <div className="result-details">           
            {pontosGanhos !== undefined && (
              <div className="pontos-ganhos-display">
                {pontosGanhos > 0 ? (
                  <>
                    <div className="pontos-value">+{pontosGanhos}</div>
                    <div className="pontos-label">pontos ganhos</div>
                  </>
                ) : (
                  <div className="pontos-zero">Nenhum ponto ganho</div>
                )}
              </div>
            )}
          </div>

          <button onClick={onClose} className="btn-fechar-result">
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

export default BattleLog;