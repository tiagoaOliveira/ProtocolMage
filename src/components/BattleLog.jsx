import React, { useState } from 'react';
import './BattleLog.css';

const BattleLog = ({ logTurnos, userName, oponenteName, onClose }) => {
  const [turnoAtual, setTurnoAtual] = useState(0);

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

  const inicio = logTurnos[0]?.inicio;
  const turno = logTurnos[turnoAtual + 1]; // +1 pois [0] é o início
  const totalTurnos = logTurnos.length - 1;

  const getVencedor = () => {
    const ultimoTurno = logTurnos[logTurnos.length - 1];
    if (ultimoTurno.hpUser > 0) return userName;
    if (ultimoTurno.hpOponente > 0) return oponenteName;
    return "Empate";
  };

  const formatAction = (action) => {
    if (!action) return null;

    const parts = [];
    
    // Nome da skill/action
    if (action.nome) {
      parts.push(`🎯 ${action.nome}`);
    } else if (action.tipo === 'basic') {
      parts.push(`⚔️ Ataque Básico`);
    } else if (action.tipo === 'stunned') {
      return <div>😵 Atordoado (perdeu o turno)</div>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {parts.map((p, i) => <div key={i}>{p}</div>)}
        
        {action.dano_causado > 0 && (
          <div>💥 {action.dano_causado} de dano</div>
        )}
        
        {action.bloqueado && (
          <div>🛡️ BLOQUEADO</div>
        )}
        
        {action.cura > 0 && (
          <div>💚 +{action.cura} HP</div>
        )}
        
        {action.hits > 1 && (
          <div>🎯 {action.hits}x hits</div>
        )}
        
        {action.execucao && (
          <div>⚡ EXECUÇÃO ATIVA (HP {'<'} 30%)</div>
        )}
        
        {action.dot_aplicado && (
          <div>🔥 DOT aplicado (dano inicial: {action.dano_inicial})</div>
        )}
        
        {action.buff_permanente && (
          <div>📈 {action.buff_permanente}</div>
        )}
        
        {action.delayed && (
          <div>⏰ Ativará em {action.delayed}</div>
        )}
        
        {action.dano_refletido > 0 && (
          <div>🪞 Refletiu {action.dano_refletido} de dano</div>
        )}
        
        {action.armor_bloqueou > 0 && (
          <div>🛡️ Escudo Arcano bloqueou {action.armor_bloqueou}</div>
        )}
        
        {action.armor_stacks && (
          <div>🛡️ {action.armor_stacks} esferas ativas (20% redução cada)</div>
        )}
        
        {action.armor_reduction && (
          <div>📈 Projeção Maldita aumentou dano em {action.armor_reduction}</div>
        )}
        
        {action.buff_aplicado && (
          <div>📈 Buff aplicado: {action.buff_aplicado}</div>
        )}
        
        {action.debuff_aplicado && (
          <div>⬇️ Debuff aplicado: {action.debuff_aplicado}</div>
        )}
        
        {action.stun && (
          <div>😵 Alvo atordoado no próximo turno</div>
        )}
      </div>
    );
  };

  const renderStatusEffects = (efeitos) => {
    if (!efeitos || efeitos.length === 0) return null;

    return efeitos.map((efeitoObj, idx) => (
      <div key={idx} style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'white' }}>
          {efeitoObj.alvo === 'user' ? `📍 ${userName}` : `📍 ${oponenteName}`}
        </div>
        
        {/* DOTs */}
        {efeitoObj.dots && efeitoObj.dots.map((dot, i) => (
          <div key={i} style={{ paddingLeft: '20px', color: '#ff6464', fontSize: '0.95rem' }}>
            🔥 {dot.nome}: {dot.dano} de dano
          </div>
        ))}
        
        {/* Efeitos antigos (compatibilidade) */}
        {efeitoObj.efeitos && efeitoObj.efeitos.map((e, i) => (
          <div key={i} style={{ paddingLeft: '20px', color: '#ff6464', fontSize: '0.95rem' }}>
            {e.tipo === 'dot' && `🔥 ${e.nome}: ${e.dano} de dano`}
            {e.tipo === 'delayed' && `⚡ ${e.nome}: ${e.dano} de dano`}
            {e.tipo === 'debuff_ataque' && `⬇️ ${e.nome}: -${e.reducao} ataque`}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="battle-log-overlay" onClick={onClose}>
      <div className="battle-log-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="battle-log-header">
          <h2>📜 Log de Batalha</h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        {/* Stats Iniciais */}
        {turnoAtual === 0 && inicio && (
          <div className="inicio-box">
            <h3 className="subtitle">⚔️ Estatísticas Iniciais</h3>
            <div className="stats-grid">
              <div className="stat-block">
                <div className="stat-label">{userName}</div>
                <div>❤️ HP: {inicio.user.hp}</div>
                <div>⚔️ Ataque: {inicio.user.attack}</div>
                <div>⭐ Nível: {inicio.user.nivel}</div>
              </div>
              <div className="versus">VS</div>
              <div className="stat-block">
                <div className="stat-label">{oponenteName}</div>
                <div>❤️ HP: {inicio.oponente.hp}</div>
                <div>⚔️ Ataque: {inicio.oponente.attack}</div>
                <div>⭐ Nível: {inicio.oponente.nivel}</div>
              </div>
            </div>
          </div>
        )}

        {/* Turno Atual */}
        {turno && (
          <div className="turno-box">
            <div className="turno-header">
              <h3 className="turno-title">🎮 Turno {turno.turn}</h3>
              <div className="hp-display">
                <span className="hp-user">
                  {userName}: {turno.hpUser} HP
                </span>
                <span className="hp-oponente">
                  {oponenteName}: {turno.hpOponente} HP
                </span>
              </div>
            </div>

            {/* Status Effects (DOTs, etc) */}
            {turno.status_effects && turno.status_effects.length > 0 && (
              <div className="status-section">
                <div className="section-title">🔥 Efeitos de Status (início do turno)</div>
                {renderStatusEffects(turno.status_effects)}
              </div>
            )}

            {/* Buffs aplicados */}
            {(turno.buff_aplicado_user || turno.buff_aplicado_opponent) && (
              <div className="buff-section">
                <div className="section-title">📈 Buffs Ativados</div>
                {turno.buff_aplicado_user && (
                  <div className="buff">{userName}: {turno.buff_aplicado_user}</div>
                )}
                {turno.buff_aplicado_opponent && (
                  <div className="buff">{oponenteName}: {turno.buff_aplicado_opponent}</div>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="actions-section">
              <div className="section-title">⚔️ Ações</div>
              
              {turno.actions.map((action, idx) => (
                <div 
                  key={idx} 
                  className={`action-box ${action.actor === 'user' ? 'action-user' : 'action-opponent'}`}
                >
                  <div className="action-actor">
                    {action.actor === 'user' ? `🔵 ${userName}` : `🔴 ${oponenteName}`}
                  </div>
                  <div className="action-detail">
                    {formatAction(action)}
                  </div>
                  {action.hp_restante !== undefined && (
                    <div className="hp-restante">
                      HP restante do alvo: {action.hp_restante}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="battle-navigation">
          <button 
            onClick={() => setTurnoAtual(Math.max(0, turnoAtual - 1))}
            disabled={turnoAtual === 0}
          >
            ← Anterior
          </button>
          
          <span>
            {turnoAtual === 0 ? 'Início' : `Turno ${turnoAtual}`} / {totalTurnos}
          </span>
          
          <button 
            onClick={() => setTurnoAtual(Math.min(totalTurnos, turnoAtual + 1))}
            disabled={turnoAtual === totalTurnos}
          >
            Próximo →
          </button>
        </div>

        {/* Resultado Final */}
        {turnoAtual === totalTurnos && (
          <div className="battle-result">
            <h2>
              {getVencedor() === userName ? '🎉 VITÓRIA!' : 
               getVencedor() === oponenteName ? '💀 DERROTA' : '🤝 EMPATE'}
            </h2>
            <p>Vencedor: <strong>{getVencedor()}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleLog;