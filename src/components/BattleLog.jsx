import React, { useState, useEffect } from 'react';
import './BattleLog.css';

const BattleLog = ({ logTurnos, userName, oponenteName, onClose }) => {
  const [turnoAtual, setTurnoAtual] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || turnoAtual >= logTurnos.length) return;

    const timer = setTimeout(() => {
      setTurnoAtual(prev => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [turnoAtual, autoPlay, logTurnos.length]);

  const turno = logTurnos[turnoAtual];
  const isUltimoTurno = turnoAtual === logTurnos.length - 1;

  if (!turno) return null;

  const formatarAcao = (acao) => {
    if (acao.tipo === 'ataque_basico') {
      return {
        nome: 'Ataque Básico',
        imagem: null,
        dano: acao.dano
      };
    }
    return {
      nome: acao.skill?.name || 'Skill',
      imagem: SKILL_IMAGES[acao.skill?.id],
      dano: acao.dano || 0,
      cura: acao.cura,
      efeito: acao.efeito,
      dot_aplicado: acao.dot_aplicado
    };
  };

  const acaoUser = formatarAcao(turno.user);
  const acaoOponente = formatarAcao(turno.oponente);

  const maxHpUser = logTurnos[0]?.stats_iniciais?.user?.hp || turno.user_hp;
  const maxHpOponente = logTurnos[0]?.stats_iniciais?.oponente?.hp || turno.oponente_hp;

  return (
    <div className="battle-log-overlay" onClick={onClose}>
      <div className="battle-log-container" onClick={e => e.stopPropagation()}>
        <div className="battle-log-header">
          <h2>Batalha - Turno {turno.turno}</h2>
          <div className="battle-controls">
            <button 
              className={`btn-auto ${autoPlay ? 'active' : ''}`}
              onClick={() => setAutoPlay(!autoPlay)}
            >
              {autoPlay ? '⏸' : '▶'}
            </button>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="battle-arena">
          <div className="battle-player user">
            <div className="player-info">
              <h3>{userName}</h3>
              <div className="hp-bar">
                <div 
                  className="hp-fill user-hp"
                  style={{ width: `${(turno.user_hp / maxHpUser) * 100}%` }}
                />
                <span className="hp-text">{turno.user_hp} / {maxHpUser}</span>
              </div>
            </div>

            {acaoUser.dano > 0 && (
              <div className="damage-number user-damage">-{acaoUser.dano}</div>
            )}
            {acaoUser.cura > 0 && (
              <div className="heal-number">+{acaoUser.cura}</div>
            )}

            <div className="action-display">
              {acaoUser.imagem && (
                <img src={acaoUser.imagem} alt={acaoUser.nome} className="skill-icon" />
              )}
              <p className="action-name">{acaoUser.nome}</p>
              {acaoUser.especial && <span className="special-badge">✨</span>}
            </div>
          </div>

          <div className="battle-vs">VS</div>

          <div className="battle-player oponente">
            <div className="player-info">
              <h3>{oponenteName}</h3>
              <div className="hp-bar">
                <div 
                  className="hp-fill oponente-hp"
                  style={{ width: `${(turno.oponente_hp / maxHpOponente) * 100}%` }}
                />
                <span className="hp-text">{turno.oponente_hp} / {maxHpOponente}</span>
              </div>
            </div>

            {acaoOponente.dano > 0 && (
              <div className="damage-number oponente-damage">-{acaoOponente.dano}</div>
            )}
            {acaoOponente.cura > 0 && (
              <div className="heal-number">+{acaoOponente.cura}</div>
            )}

            <div className="action-display">
              {acaoOponente.imagem && (
                <img src={acaoOponente.imagem} alt={acaoOponente.nome} className="skill-icon" />
              )}
              <p className="action-name">{acaoOponente.nome}</p>
              {acaoOponente.especial && <span className="special-badge">✨</span>}
            </div>
          </div>
        </div>

        <div className="battle-navigation">
          <button 
            onClick={() => setTurnoAtual(Math.max(0, turnoAtual - 1))}
            disabled={turnoAtual === 0}
          >
            ← Anterior
          </button>
          <span>{turnoAtual + 1} / {logTurnos.length}</span>
          <button 
            onClick={() => setTurnoAtual(Math.min(logTurnos.length - 1, turnoAtual + 1))}
            disabled={isUltimoTurno}
          >
            Próximo →
          </button>
        </div>

        {isUltimoTurno && (
          <div className="battle-result">
            <h2>{turno.user_hp > 0 ? '🎉 Vitória!' : '💀 Derrota'}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleLog;