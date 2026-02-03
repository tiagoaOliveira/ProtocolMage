import React, { useState } from 'react';
import './Logview.css';

const Logview = ({
  logTurnos = [],
  userName = 'Você',
  oponenteName = 'Oponente',
  onClose,
  onSkillClick, 
  availableSkills = [] 
}) => {
  const [turnoAtual, setTurnoAtual] = useState(0);

  if (!logTurnos || logTurnos.length === 0) {
    return (
      <div className="battle-log-overlay-test" onClick={onClose}>
        <div className="battle-log-container-test" onClick={e => e.stopPropagation()}>
          <p className="battle-log-error">Nenhum log de batalha disponível</p>
          <button onClick={onClose} className="battle-log-close-btn">Fechar</button>
        </div>
      </div>
    );
  }

  // Verifica se precisa inverter o log
  const inicio = logTurnos[0]?.inicio;
  const precisaInverter = inicio && 
    inicio.oponente && 
    inicio.oponente.nome === userName;

  // Processa o log: inverte se necessário
  const logProcessado = precisaInverter ? logTurnos.map(turno => {
    if (turno.inicio) {
      return {
        ...turno,
        inicio: {
          user: turno.inicio.oponente,
          oponente: turno.inicio.user
        }
      };
    }
    
    return {
      ...turno,
      turn: turno.turn,
      hpUser: turno.hpOponente,
      hpOponente: turno.hpUser,
      actions: turno.actions?.map(a => ({
        ...a,
        actor: a.actor === 'user' ? 'opponent' : 'user'
      })) || [],
      status_effects: turno.status_effects?.map(s => ({
        ...s,
        alvo: s.alvo === 'user' ? 'opponent' : 'user'
      })) || []
    };
  }) : logTurnos;

  const inicioProcessado = logProcessado[0]?.inicio;
  const userLabel = userName;
  const oponenteLabel = oponenteName;

  const turno = turnoAtual > 0 ? logProcessado[turnoAtual] : null;
  const totalTurnos = logProcessado.length - 1;

  // Detecta quem atacou primeiro no turno 1
  const primeiraAcao = logProcessado[1]?.actions?.[0];
  const primeiroAtacante = primeiraAcao?.actor || 'user'; // 'user' ou 'opponent'

  const getVencedor = () => {
    const ultimoTurno = logProcessado[logProcessado.length - 1];
    if (ultimoTurno.hpUser > 0) return userLabel;
    if (ultimoTurno.hpOponente > 0) return oponenteLabel;
    return "Empate";
  };

  const formatAction = (action) => {
    if (!action) return null;

    const parts = [];

    if (action.nome) {
      parts.push(`🎯 ${action.nome}`);
    } else if (action.tipo === 'basic') {
      parts.push(`⚔️ Ataque Básico`);
    } else if (action.tipo === 'stunned') {
      return '😵 Atordoado (perdeu o turno)';
    }

    if (action.dano_causado > 0) {
      parts.push(`💥 ${action.dano_causado} de dano`);
    }

    if (action.dano > 0) {
      parts.push(`💥 ${action.dano} de dano`);
    }

    if (action.dano_inicial > 0) {
      parts.push(`💥 ${action.dano_inicial} de dano inicial`);
    }

    if (action.bloqueado) {
      parts.push(`🛡️ BLOQUEADO`);
    }

    if (action.cura > 0) {
      parts.push(`💚 +${action.cura} HP`);
    }

    if (action.hits > 1) {
      parts.push(`(${action.hits}x hits)`);
    }

    if (action.execucao_ativa) {
      parts.push(`⚡ EXECUÇÃO ATIVA`);
    }

    if (action.dot_aplicado) {
      parts.push(`🔥 DOT aplicado`);
    }

    if (action.tipo === 'dot') {
      parts.push(`🔥 DOT aplicado`);
    }

    if (action.buff_permanente) {
      parts.push(`📈 ${action.buff_permanente}`);
    }

    if (action.block_ativo) {
      parts.push(`🛡️ Bloqueio ativado para próximo turno`);
    }

    if (action.delayed) {
      parts.push(`⏰ Ativará em ${action.delayed}`);
    }

    if (action.ignorou_armor) {
      parts.push(`🎯 Ignorou defesa`);
    }

    return parts.join(' | ');
  };

  const getUserActions = (actions) => {
    return actions.filter(action => action.actor === 'user');
  };

  const getOpponentActions = (actions) => {
    return actions.filter(action => action.actor === 'opponent');
  };

  const getUserDamageTaken = (actions) => {
    return actions.filter(action => action.actor === 'opponent' && (action.dano > 0 || action.dano_causado > 0));
  };

  const getOpponentDamageTaken = (actions) => {
    return actions.filter(action => action.actor === 'user' && (action.dano > 0 || action.dano_causado > 0 || action.dano_inicial > 0));
  };

  const renderStatusEffects = (alvo) => {
    if (!turno?.status_effects || turno.status_effects.length === 0) return null;

    const effects = turno.status_effects.filter(efeitoObj => efeitoObj.alvo === alvo);
    if (effects.length === 0) return null;

    return effects.map((efeitoObj, idx) => (
      <div key={idx}>
        {efeitoObj.dots && efeitoObj.dots.map((d, i) => (
          <div key={i} className="battle-log-status-effect">
            🔥 {d.nome}: {d.dano} de dano
          </div>
        ))}
      </div>
    ));
  };

  // Define quem é o primeiro e segundo atacante
  const primeiroLabel = primeiroAtacante === 'user' ? userLabel : oponenteLabel;
  const segundoLabel = primeiroAtacante === 'user' ? oponenteLabel : userLabel;
  const primeiroActor = primeiroAtacante;
  const segundoActor = primeiroAtacante === 'user' ? 'opponent' : 'user';

  return (
    <div className="battle-log-overlay-test" onClick={onClose}>
      <div className="battle-log-container-test" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="battle-log-header-test">
          <h2 className="battle-log-title">📜 Log de Batalha</h2>
          <button onClick={onClose} className="battle-log-close-btn">✕</button>
        </div>

        {/* Content com scroll */}
        <div className="battle-log-content">
          {/* Stats Iniciais */}
          {turnoAtual === 0 && inicioProcessado && (
            <div className="battle-log-inicio-box">
              <h3 className="battle-log-subtitle">⚔️ Estatísticas Iniciais</h3>
              <div className="battle-log-stats-grid">
                <div className="battle-log-stat-block">
                  <div className="battle-log-stat-label">{userLabel}</div>
                  <div>❤️ HP: {inicioProcessado.user.hp}</div>
                  <div>⚔️ Ataque: {inicioProcessado.user.attack}</div>
                  <div>⭐ Nível: {inicioProcessado.user.nivel}</div>
                  
                  {inicioProcessado.user.skills?.length > 0 && (
                    <div className='skills-iniciais-section'>
                      <div className='skills-text'>
                        🎯 Magias Equipadas:
                      </div>
                      <div className='skills-iniciais'>
                        {inicioProcessado.user.skills.map((skillData, idx) => {
                          const fullSkill = availableSkills.find(s => s.skill?.name === skillData.nome);
                          return (
                            <div
                              key={idx}
                              onClick={() => fullSkill && onSkillClick?.(fullSkill.skill)}
                              className='skills-log'
                              style={{ cursor: onSkillClick ? 'pointer' : 'default' }}>
                              {fullSkill?.skill?.image ? (
                                <img 
                                  src={fullSkill.skill.image} 
                                  alt={skillData.nome}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                              ) : (
                                <div style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  background: 'rgba(255,255,255,0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  color: '#ffd700'
                                }}>
                                  {skillData.nome?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="battle-log-versus">VS</div>
                
                <div className="battle-log-stat-block">
                  <div className="battle-log-stat-label">{oponenteLabel}</div>
                  <div>❤️ HP: {inicioProcessado.oponente.hp}</div>
                  <div>⚔️ Ataque: {inicioProcessado.oponente.attack}</div>
                  <div>⭐ Nível: {inicioProcessado.oponente.nivel}</div>
                  
                  {inicioProcessado.oponente.skills?.length > 0 && (
                    <div className='skills-iniciais-section'>
                      <div className='skills-text'>
                        🎯 Magias Equipadas:
                      </div>
                      <div className='skills-iniciais'>
                        {inicioProcessado.oponente.skills.map((skillData, idx) => {
                          const fullSkill = availableSkills.find(s => s.skill?.name === skillData.nome);
                          return (
                            <div
                              key={idx}
                              onClick={() => fullSkill && onSkillClick?.(fullSkill.skill)}
                              className='skills-log'
                              style={{ cursor: onSkillClick ? 'pointer' : 'default' }}>
                              {fullSkill?.skill?.image ? (
                                <img 
                                  src={fullSkill.skill.image} 
                                  alt={skillData.nome}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                              ) : (
                                <div style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  background: 'rgba(255,255,255,0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  color: '#ffd700'
                                }}>
                                  {skillData.nome?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Turno Atual */}
          {turno && turnoAtual > 0 && (
            <div className="battle-log-turno-box">
              <div className="battle-log-turno-header">
                <div className="battle-log-hp-display">
                  <span className="battle-log-hp-user">
                    {primeiroLabel}: {primeiroActor === 'user' ? turno.hpUser : turno.hpOponente} HP
                  </span>
                  <span className="battle-log-hp-oponente">
                    {segundoLabel}: {segundoActor === 'user' ? turno.hpUser : turno.hpOponente} HP
                  </span>
                </div>
              </div>

              {/* Grid com 2 colunas: PRIMEIRO atacante (azul) e SEGUNDO atacante (vermelho) */}
              <div className="battle-log-combatants-grid">
                {/* Coluna do PRIMEIRO atacante (azul) */}
                <div className="battle-log-combatant-column user">
                  <div className="battle-log-combatant-header user">
                    🔵 {primeiroLabel}
                  </div>

                  {/* Status Effects */}
                  {turno.status_effects && turno.status_effects.some(e => e.alvo === primeiroActor) && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">🔥 Efeitos Ativos</div>
                      <div className="battle-log-status-section">
                        {renderStatusEffects(primeiroActor)}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  {turno.actions.filter(a => a.actor === primeiroActor).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">⚔️ Ação</div>
                      {turno.actions.filter(a => a.actor === primeiroActor).map((action, idx) => (
                        <div key={idx} className="battle-log-action-item user">
                          <div className="battle-log-action-detail">
                            {formatAction(action)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dano Recebido */}
                  {turno.actions.filter(a => a.actor === segundoActor && (a.dano > 0 || a.dano_causado > 0 || a.dano_inicial > 0)).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">💔 Dano Recebido</div>
                      {turno.actions.filter(a => a.actor === segundoActor && (a.dano > 0 || a.dano_causado > 0 || a.dano_inicial > 0)).map((action, idx) => (
                        <div key={idx} className="battle-log-damage-taken">
                          💥 {action.dano || action.dano_causado || action.dano_inicial} de dano de {action.nome || 'Ataque'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coluna do SEGUNDO atacante (vermelho) */}
                <div className="battle-log-combatant-column opponent">
                  <div className="battle-log-combatant-header opponent">
                    🔴 {segundoLabel}
                  </div>

                  {/* Status Effects */}
                  {turno.status_effects && turno.status_effects.some(e => e.alvo === segundoActor) && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">🔥 Efeitos Ativos</div>
                      <div className="battle-log-status-section">
                        {renderStatusEffects(segundoActor)}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  {turno.actions.filter(a => a.actor === segundoActor).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">⚔️ Ação</div>
                      {turno.actions.filter(a => a.actor === segundoActor).map((action, idx) => (
                        <div key={idx} className="battle-log-action-item opponent">
                          <div className="battle-log-action-detail">
                            {formatAction(action)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dano Recebido */}
                  {turno.actions.filter(a => a.actor === primeiroActor && (a.dano > 0 || a.dano_causado > 0 || a.dano_inicial > 0)).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">💔 Dano Recebido</div>
                      {turno.actions.filter(a => a.actor === primeiroActor && (a.dano > 0 || a.dano_causado > 0 || a.dano_inicial > 0)).map((action, idx) => (
                        <div key={idx} className="battle-log-damage-taken">
                          💥 {action.dano || action.dano_causado || action.dano_inicial} de dano de {action.nome || 'Ataque'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resultado Final */}
          {turnoAtual === totalTurnos && (
            <div className="battle-log-resultado">
              <h2 className="battle-log-resultado-title">
                {getVencedor() === userLabel ? '🎉 VITÓRIA!' :
                  getVencedor() === oponenteLabel ? '💀 DERROTA' : '🤝 EMPATE'}
              </h2>
            </div>
          )}
        </div>

        {/* Navegação */}
        <div className="battle-log-navigation">
          <button
            onClick={() => setTurnoAtual(Math.max(0, turnoAtual - 1))}
            disabled={turnoAtual === 0}
            className="battle-log-nav-btn"
          >
            ←
          </button>
          <span className="battle-log-nav-text">
            {turnoAtual === 0 ? 'Início' : `Turno ${turno?.turn || turnoAtual}`} / {totalTurnos} turnos
          </span>
          <button
            onClick={() => setTurnoAtual(Math.min(totalTurnos, turnoAtual + 1))}
            disabled={turnoAtual === totalTurnos}
            className="battle-log-nav-btn"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logview;