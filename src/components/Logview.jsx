import React, { useState } from 'react';
import './logview.css';

const BattleLog = ({
  logTurnos = logTurnosMock,
  onClose
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

  const inicio = logTurnos[0]?.inicio;
  const userLabel = inicio?.user?.nome || 'User';
  const oponenteLabel = inicio?.oponente?.nome || 'Oponente';

  const turno = turnoAtual > 0 ? logTurnos[turnoAtual] : null;
  const totalTurnos = logTurnos.length - 1;

  const getVencedor = () => {
    const ultimoTurno = logTurnos[logTurnos.length - 1];
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
  const getHpNoTurno = () => {
  let hpUser = inicio.user.hp;
  let hpOponente = inicio.oponente.hp;

  for (let i = 1; i <= turnoAtual; i++) {
    const t = logTurnos[i];
    if (!t?.actions) continue;

    t.actions.forEach(action => {
      if (typeof action.hp_restante !== 'number') return;

      if (action.actor === 'user') {
        // user atacou → oponente perdeu HP
        hpOponente = action.hp_restante;
      } else if (action.actor === 'opponent') {
        // oponente atacou → user perdeu HP
        hpUser = action.hp_restante;
      }
    });
  }

  return { hpUser, hpOponente };
};
const { hpUser, hpOponente } = getHpNoTurno();


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
          {turnoAtual === 0 && inicio && (
            <div className="battle-log-inicio-box">
              <h3 className="battle-log-subtitle">⚔️ Estatísticas Iniciais</h3>
              <div className="battle-log-stats-grid">
                <div className="battle-log-stat-block">
                  <div className="battle-log-stat-label">{userLabel}</div>
                  <div>❤️ HP: {inicio.user.hp}</div>
                  <div>⚔️ Ataque: {inicio.user.attack}</div>
                  <div>⭐ Nível: {inicio.user.nivel}</div>
                </div>
                <div className="battle-log-versus">VS</div>
                <div className="battle-log-stat-block">
                  <div className="battle-log-stat-label">{oponenteLabel}</div>
                  <div>❤️ HP: {inicio.oponente.hp}</div>
                  <div>⚔️ Ataque: {inicio.oponente.attack}</div>
                  <div>⭐ Nível: {inicio.oponente.nivel}</div>
                </div>
              </div>
            </div>
          )}

          {/* Turno Atual */}
          {turno && turnoAtual > 0 && (
            <div className="battle-log-turno-box">
              <div className="battle-log-turno-header">
                <h3 className="battle-log-turno-title">Turno {turno.turn}</h3>
                <div className="battle-log-hp-display">
                  <span className="battle-log-hp-user">
                    {userLabel}: {turno.hpUser} HP
                  </span>
                  <span className="battle-log-hp-oponente">
                    {oponenteLabel}: {turno.hpOponente} HP
                  </span>
                </div>
              </div>

              {/* Grid com 2 colunas: User e Oponente */}
              <div className="battle-log-combatants-grid">
                {/* Coluna do User */}
                <div className="battle-log-combatant-column user">
                  <div className="battle-log-combatant-header user">
                    🔵 {userLabel}
                  </div>

                  {/* Status Effects do User */}
                  {turno.status_effects && turno.status_effects.some(e => e.alvo === 'user') && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">🔥 Efeitos Ativos</div>
                      <div className="battle-log-status-section">
                        {renderStatusEffects('user')}
                      </div>
                    </div>
                  )}

                  {/* Ações do User */}
                  {getUserActions(turno.actions).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">⚔️ Ações</div>
                      {getUserActions(turno.actions).map((action, idx) => (
                        <div key={idx} className="battle-log-action-item user">
                          <div className="battle-log-action-detail">
                            {formatAction(action)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dano Recebido pelo User */}
                  {getUserDamageTaken(turno.actions).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">💔 Dano Recebido</div>
                      {getUserDamageTaken(turno.actions).map((action, idx) => (
                        <div key={idx} className="battle-log-damage-taken">
                          💥 {action.dano || action.dano_causado} de dano de {action.nome || 'Ataque'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coluna do Oponente */}
                <div className="battle-log-combatant-column opponent">
                  <div className="battle-log-combatant-header opponent">
                    🔴 {oponenteLabel}
                  </div>

                  {/* Status Effects do Oponente */}
                  {turno.status_effects && turno.status_effects.some(e => e.alvo === 'opponent') && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">🔥 Efeitos Ativos</div>
                      <div className="battle-log-status-section">
                        {renderStatusEffects('opponent')}
                      </div>
                    </div>
                  )}

                  {/* Ações do Oponente */}
                  {getOpponentActions(turno.actions).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">⚔️ Ações</div>
                      {getOpponentActions(turno.actions).map((action, idx) => (
                        <div key={idx} className="battle-log-action-item opponent">
                          <div className="battle-log-action-detail">
                            {formatAction(action)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dano Recebido pelo Oponente */}
                  {getOpponentDamageTaken(turno.actions).length > 0 && (
                    <div className="battle-log-section">
                      <div className="battle-log-section-title">💔 Dano Recebido</div>
                      {getOpponentDamageTaken(turno.actions).map((action, idx) => (
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
              <p className="battle-log-resultado-text">
                Vencedor: <strong>{getVencedor()}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Navegação - Fixa na parte de baixo */}
        <div className="battle-log-navigation">
          <button
            onClick={() => setTurnoAtual(Math.max(0, turnoAtual - 1))}
            disabled={turnoAtual === 0}
            className="battle-log-nav-btn"
          >
            ← Anterior
          </button>

          <span className="battle-log-nav-text">
            {turnoAtual === 0 ? 'Início' : `Turno ${turno?.turn || turnoAtual}`} / {totalTurnos} turnos
          </span>

          <button
            onClick={() => setTurnoAtual(Math.min(totalTurnos, turnoAtual + 1))}
            disabled={turnoAtual === totalTurnos}
            className="battle-log-nav-btn"
          >
            Próximo →
          </button>
        </div>
      </div>
    </div>
  );
};

const logTurnosMock = [
  {
    "inicio": {
      "user": {
        "hp": 13000,
        "nome": "teste2",
        "nivel": 60,
        "attack": 650
      },
      "oponente": {
        "hp": 13000,
        "nome": "teste",
        "nivel": 60,
        "attack": 650
      }
    }
  },
  {
    "turn": 1,
    "hpUser": 13000,
    "actions": [
      {
        "dano": 1950,
        "nome": "Insanidade Explosiva",
        "tipo": "dano",
        "actor": "user",
        "skillId": 18,
        "hp_restante": 11050,
        "self_debuff": "+5% dano recebido permanente"
      },
      {
        "nome": "Levitação",
        "stun": true,
        "tipo": "debuff",
        "actor": "opponent",
        "skillId": 8,
        "hp_restante": 13000
      }
    ],
    "hpOponente": 11050,
    "status_effects": []
  },
  {
    "turn": 2,
    "hpUser": 12727,
    "actions": [
      {
        "tipo": "stunned",
        "actor": "user"
      },
      {
        "nome": "Chuva Meteórica",
        "tipo": "dot",
        "actor": "opponent",
        "skillId": 13,
        "hp_restante": 12727,
        "dano_inicial": 273
      }
    ],
    "hpOponente": 11050,
    "status_effects": []
  },
  {
    "turn": 3,
    "hpUser": 11977,
    "actions": [
      {
        "dano": 1950,
        "nome": "Julgamento Celestial",
        "tipo": "dano",
        "actor": "user",
        "skillId": 6,
        "hp_restante": 9100
      },
      {
        "nome": "Chuva Astral",
        "tipo": "dot",
        "actor": "opponent",
        "skillId": 1,
        "hp_restante": 11977,
        "dano_inicial": 477
      }
    ],
    "hpOponente": 9100,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          }
        ]
      }
    ]
  },
  {
    "turn": 4,
    "hpUser": 11227,
    "actions": [
      {
        "dano": 1300,
        "nome": "Aero Impacto",
        "tipo": "dano",
        "actor": "user",
        "skillId": 10,
        "hp_restante": 7800
      },
      {
        "nome": "Espelho Mágico",
        "tipo": "buff",
        "actor": "opponent",
        "skillId": 7,
        "hp_restante": 11227
      }
    ],
    "hpOponente": 7800,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          },
          {
            "dano": 477,
            "nome": "Chuva Astral"
          }
        ]
      }
    ]
  },
  {
    "turn": 5,
    "hpUser": 8804,
    "actions": [
      {
        "dano": 650,
        "nome": "Golpe Sagaz",
        "tipo": "dano",
        "actor": "user",
        "skillId": 12,
        "refletido": 650,
        "hp_restante": 7150
      },
      {
        "dano": 1023,
        "nome": "Torrente Perfurante",
        "tipo": "dano",
        "actor": "opponent",
        "skillId": 4,
        "hp_restante": 8804
      }
    ],
    "hpOponente": 7150,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          },
          {
            "dano": 477,
            "nome": "Chuva Astral"
          }
        ]
      }
    ]
  },
  {
    "turn": 6,
    "hpUser": 7508,
    "actions": [
      {
        "dano": 975,
        "nome": "Execução",
        "tipo": "dano",
        "actor": "user",
        "skillId": 15,
        "hp_restante": 6175
      },
      {
        "dano": 1023,
        "nome": "Execução",
        "tipo": "dano",
        "actor": "opponent",
        "skillId": 15,
        "hp_restante": 7508
      }
    ],
    "hpOponente": 6175,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          }
        ]
      }
    ]
  },
  {
    "turn": 7,
    "hpUser": 7235,
    "actions": [
      {
        "dano": 975,
        "nome": "Torrente Perfurante",
        "tipo": "dano",
        "actor": "user",
        "skillId": 4,
        "hp_restante": 5200
      },
      {
        "nome": "Levitação",
        "stun": true,
        "tipo": "debuff",
        "actor": "opponent",
        "skillId": 8,
        "hp_restante": 7235
      }
    ],
    "hpOponente": 5200,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          }
        ]
      }
    ]
  },
  {
    "turn": 8,
    "hpUser": 6962,
    "actions": [
      {
        "tipo": "stunned",
        "actor": "user"
      },
      {
        "nome": "Espelho Mágico",
        "tipo": "buff",
        "actor": "opponent",
        "skillId": 7,
        "hp_restante": 6962
      }
    ],
    "hpOponente": 5200,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          }
        ]
      }
    ]
  },
  {
    "turn": 9,
    "hpUser": 5032,
    "actions": [
      {
        "dano": 975,
        "nome": "Insanidade Explosiva",
        "tipo": "dano",
        "actor": "user",
        "skillId": 18,
        "refletido": 975,
        "hp_restante": 4225
      },
      {
        "dano": 682,
        "tipo": "basic",
        "actor": "opponent",
        "hp_restante": 5032
      }
    ],
    "hpOponente": 4225,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          }
        ]
      }
    ]
  },
  {
    "turn": 10,
    "hpUser": 4282,
    "actions": [
      {
        "dano": 1300,
        "nome": "Aero Impacto",
        "tipo": "dano",
        "actor": "user",
        "skillId": 10,
        "hp_restante": 2925
      },
      {
        "nome": "Chuva Astral",
        "tipo": "dot",
        "actor": "opponent",
        "skillId": 1,
        "hp_restante": 4282,
        "dano_inicial": 477
      }
    ],
    "hpOponente": 2925,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          }
        ]
      }
    ]
  },
  {
    "turn": 11,
    "hpUser": 2509,
    "actions": [
      {
        "dano": 1950,
        "nome": "Execução",
        "tipo": "dano",
        "actor": "user",
        "skillId": 15,
        "execucao": true,
        "hp_restante": 975
      },
      {
        "dano": 1023,
        "nome": "Torrente Perfurante",
        "tipo": "dano",
        "actor": "opponent",
        "skillId": 4,
        "hp_restante": 2509
      }
    ],
    "hpOponente": 975,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          },
          {
            "dano": 477,
            "nome": "Chuva Astral"
          }
        ]
      }
    ]
  },
  {
    "turn": 12,
    "hpUser": 1759,
    "actions": [
      {
        "dano": 975,
        "nome": "Torrente Perfurante",
        "tipo": "dano",
        "actor": "user",
        "skillId": 4,
        "hp_restante": 0
      }
    ],
    "hpOponente": 0,
    "status_effects": [
      {
        "alvo": "user",
        "dots": [
          {
            "dano": 273,
            "nome": "Chuva Meteórica"
          },
          {
            "dano": 477,
            "nome": "Chuva Astral"
          }
        ]
      }
    ]
  }
]

export default BattleLog;