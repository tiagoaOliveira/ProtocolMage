import React, { useState } from 'react';


const BattleLog = ({
  logTurnos = logTurnosMock,
  userName = "User",
  oponenteName = "Oponente",
  onClose
}) => {
  const [turnoAtual, setTurnoAtual] = useState(0);

  if (!logTurnos || logTurnos.length === 0) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.container} onClick={e => e.stopPropagation()}>
          <p style={styles.error}>Nenhum log de batalha disponível</p>
          <button onClick={onClose} style={styles.closeBtn}>Fechar</button>
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
      return '😵 Atordoado (perdeu o turno)';
    }

    // Dano causado
    if (action.dano_causado > 0) {
      parts.push(`💥 ${action.dano_causado} de dano`);
    }

    // Bloqueio
    if (action.bloqueado) {
      parts.push(`🛡️ BLOQUEADO`);
    }

    // Cura
    if (action.cura > 0) {
      parts.push(`💚 +${action.cura} HP`);
    }

    // Hits múltiplos
    if (action.hits > 1) {
      parts.push(`(${action.hits}x hits)`);
    }

    // Execução
    if (action.execucao_ativa) {
      parts.push(`⚡ EXECUÇÃO ATIVA`);
    }

    // DOT aplicado
    if (action.dot_aplicado) {
      parts.push(`🔥 DOT aplicado`);
    }

    // Buff permanente
    if (action.buff_permanente) {
      parts.push(`📈 ${action.buff_permanente}`);
    }

    // Block ativo
    if (action.block_ativo) {
      parts.push(`🛡️ Bloqueio ativado para próximo turno`);
    }

    // Delayed
    if (action.delayed) {
      parts.push(`⏰ Ativará em ${action.delayed}`);
    }

    // Ignorou armor
    if (action.ignorou_armor) {
      parts.push(`🎯 Ignorou defesa`);
    }

    return parts.join(' | ');
  };

  const renderStatusEffects = (efeitos) => {
    if (!efeitos || efeitos.length === 0) return null;

    return efeitos.map((efeitoObj, idx) => (
      <div key={idx} style={styles.statusEffectGroup}>
        <div style={styles.statusTarget}>
          {efeitoObj.alvo === 'user' ? `📍 ${userName}` : `📍 ${oponenteName}`}
        </div>
        {efeitoObj.efeitos.map((e, i) => (
          <div key={i} style={styles.statusEffect}>
            {e.tipo === 'dot' && `🔥 ${e.nome}: ${e.dano} de dano`}
            {e.tipo === 'delayed' && `⚡ ${e.nome}: ${e.dano} de dano`}
            {e.tipo === 'debuff_ataque' && `⬇️ ${e.nome}: -${e.reducao} ataque`}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>📜 Log de Batalha</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* Stats Iniciais */}
        {turnoAtual === 0 && inicio && (
          <div style={styles.inicioBox}>
            <h3 style={styles.subtitle}>⚔️ Estatísticas Iniciais</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statBlock}>
                <div style={styles.statLabel}>{userName}</div>
                <div>❤️ HP: {inicio.user.hp}</div>
                <div>⚔️ Ataque: {inicio.user.attack}</div>
                <div>⭐ Nível: {inicio.user.nivel}</div>
              </div>
              <div style={styles.versus}>VS</div>
              <div style={styles.statBlock}>
                <div style={styles.statLabel}>{oponenteName}</div>
                <div>❤️ HP: {inicio.oponente.hp}</div>
                <div>⚔️ Ataque: {inicio.oponente.attack}</div>
                <div>⭐ Nível: {inicio.oponente.nivel}</div>
              </div>
            </div>
          </div>
        )}

        {/* Turno Atual */}
        {turno && (
          <div style={styles.turnoBox}>
            <div style={styles.turnoHeader}>
              <h3 style={styles.turnoTitle}>🎮 Turno {turno.turn}</h3>
              <div style={styles.hpDisplay}>
                <span style={styles.hpUser}>
                  {userName}: {turno.hpUser} HP
                </span>
                <span style={styles.hpOponente}>
                  {oponenteName}: {turno.hpOponente} HP
                </span>
              </div>
            </div>

            {/* Status Effects (DOTs, etc) */}
            {turno.status_effects && turno.status_effects.length > 0 && (
              <div style={styles.statusSection}>
                <div style={styles.sectionTitle}>🔥 Efeitos de Status (início do turno)</div>
                {renderStatusEffects(turno.status_effects)}
              </div>
            )}

            {/* Buffs aplicados */}
            {(turno.buff_aplicado_user || turno.buff_aplicado_opponent) && (
              <div style={styles.buffSection}>
                <div style={styles.sectionTitle}>📈 Buffs Ativados</div>
                {turno.buff_aplicado_user && (
                  <div style={styles.buff}>{userName}: {turno.buff_aplicado_user}</div>
                )}
                {turno.buff_aplicado_opponent && (
                  <div style={styles.buff}>{oponenteName}: {turno.buff_aplicado_opponent}</div>
                )}
              </div>
            )}

            {/* Ações */}
            <div style={styles.actionsSection}>
              <div style={styles.sectionTitle}>⚔️ Ações</div>

              {turno.actions.map((action, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.actionBox,
                    ...(action.actor === 'user' ? styles.actionUser : styles.actionOponent)
                  }}
                >
                  <div style={styles.actionActor}>
                    {action.actor === 'user' ? `🔵 ${userName}` : `🔴 ${oponenteName}`}
                  </div>
                  <div style={styles.actionDetail}>
                    {formatAction(action)}
                  </div>
                  {action.hp_restante !== undefined && (
                    <div style={styles.hpRestante}>
                      HP restante do alvo: {action.hp_restante}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navegação */}
        <div style={styles.navigation}>
          <button
            onClick={() => setTurnoAtual(Math.max(0, turnoAtual - 1))}
            disabled={turnoAtual === 0}
            style={styles.navBtn}
          >
            ← Anterior
          </button>

          <span style={styles.navText}>
            {turnoAtual === 0 ? 'Início' : `Turno ${turnoAtual}`} / {totalTurnos}
          </span>

          <button
            onClick={() => setTurnoAtual(Math.min(totalTurnos, turnoAtual + 1))}
            disabled={turnoAtual === totalTurnos}
            style={styles.navBtn}
          >
            Próximo →
          </button>
        </div>

        {/* Resultado Final */}
        {turnoAtual === totalTurnos && (
          <div style={styles.resultado}>
            <h2 style={styles.resultadoTitle}>
              {getVencedor() === userName ? '🎉 VITÓRIA!' :
                getVencedor() === oponenteName ? '💀 DERROTA' : '🤝 EMPATE'}
            </h2>
            <p style={styles.resultadoText}>
              Vencedor: <strong>{getVencedor()}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  container: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '2px solid #ffd700',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    color: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #ffd700',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    color: '#ffd700',
    fontSize: '1.5rem',
  },
  closeBtn: {
    background: '#ef4444',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  inicioBox: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid #ffd700',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  subtitle: {
    color: '#ffd700',
    marginTop: 0,
    marginBottom: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '20px',
    alignItems: 'center',
  },
  statBlock: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statLabel: {
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: '8px',
    fontSize: '1.1rem',
  },
  versus: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffd700',
  },
  turnoBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  turnoHeader: {
    marginBottom: '16px',
  },
  turnoTitle: {
    color: '#ffd700',
    marginTop: 0,
    marginBottom: '8px',
  },
  hpDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  hpUser: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  hpOponente: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  statusSection: {
    background: 'rgba(255, 100, 100, 0.1)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: '8px',
  },
  statusEffectGroup: {
    marginBottom: '8px',
  },
  statusTarget: {
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  statusEffect: {
    paddingLeft: '20px',
    color: '#ff6464',
    fontSize: '0.95rem',
  },
  buffSection: {
    background: 'rgba(100, 200, 255, 0.1)',
    border: '1px solid rgba(100, 200, 255, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
  },
  buff: {
    color: '#64c8ff',
    paddingLeft: '20px',
  },
  actionsSection: {
    marginTop: '12px',
  },
  actionBox: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  actionUser: {
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
  },
  actionOponent: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
  },
  actionActor: {
    fontWeight: 'bold',
    marginBottom: '6px',
  },
  actionDetail: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  hpRestante: {
    fontSize: '0.85rem',
    color: '#aaa',
    marginTop: '4px',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 215, 0, 0.3)',
  },
  navBtn: {
    background: '#ffd700',
    border: 'none',
    color: '#1a1a2e',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  navText: {
    fontWeight: 'bold',
  },
  resultado: {
    textAlign: 'center',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '2px solid #ffd700',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
  },
  resultadoTitle: {
    color: '#ffd700',
    margin: '0 0 12px 0',
  },
  resultadoText: {
    margin: 0,
    fontSize: '1.1rem',
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: '1.2rem',
  },
};

const logTurnosMock = [{ "inicio": { "user": { "hp": 13000, "nivel": 60, "attack": 650 }, "oponente": { "hp": 13000, "nivel": 60, "attack": 650 } } }, { "turn": 1, "hpUser": 13000, "actions": [{ "nome": "Julgamento Celestial", "tipo": "especial", "actor": "user", "delayed": "5 turnos", "skillId": 9, "hp_restante": 13000 }, { "nome": "Foco ", "tipo": "buff", "actor": "opponent", "skillId": 14, "hp_restante": 13000, "buff_permanente": "+15% ataque" }], "hpOponente": 13000, "status_effects": [] }, { "turn": 2, "hpUser": 13000, "actions": [{ "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "user", "skillId": 17, "hp_restante": 12025, "dano_causado": 975, "debuff_aplicado": "Próximo ataque -20%" }, { "nome": "Escudo Arcano", "tipo": "buff", "actor": "opponent", "skillId": 5, "hp_restante": 13000, "escudo_arcano": "3 esferas ativas (20% de redução cada)", "debuff_reduzir_dano": 149 }], "hpOponente": 12025, "status_effects": [] }, { "turn": 3, "hpUser": 13000, "actions": [{ "nome": "Insanidade Explosiva", "tipo": "dano", "actor": "user", "skillId": 21, "hp_restante": 10465, "self_debuff": "Tomará +50% de dano no próximo turno", "dano_causado": 1560, "escudo_arcano_bloqueou": 390 }, { "nome": "Espelho Mágico", "tipo": "buff", "actor": "opponent", "skillId": 10, "hp_restante": 13000, "reflect_ativo": true }], "hpOponente": 10465, "status_effects": [] }, { "turn": 4, "hpUser": 11490, "actions": [{ "nome": "Execução", "tipo": "dano", "actor": "user", "skillId": 18, "hp_restante": 10075, "dano_causado": 390, "dano_refletido": 390, "espelho_magico_ativo": true, "escudo_arcano_bloqueou": 195 }, { "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "opponent", "skillId": 17, "hp_restante": 11490, "dano_causado": 1120, "debuff_aplicado": "Próximo ataque -20%" }], "hpOponente": 10075, "status_effects": [] }, { "turn": 5, "hpUser": 11192, "actions": [{ "nome": "Esquiva Fantasma", "tipo": "buff", "actor": "user", "skillId": 8, "block_ativo": true, "hp_restante": 10075, "debuff_reduzir_dano": 130 }, { "nome": "Espectro Infernal ", "tipo": "dot", "actor": "opponent", "skillId": 12, "hp_restante": 11192, "dano_inicial": 298, "dot_aplicado": true }], "hpOponente": 10075, "status_effects": [] }, { "turn": 6, "hpUser": 12194, "actions": [{ "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "user", "skillId": 6, "hp_restante": 8125 }, { "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "opponent", "skillId": 6, "hp_restante": 12194 }], "hpOponente": 9425, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 298, "nome": "Espectro Infernal ", "tipo": "dot" }] }, { "alvo": "opponent", "efeitos": [{ "dano": 1950, "nome": "Julgamento Celestial", "tipo": "delayed" }] }] }, { "turn": 7, "hpUser": 11896, "actions": [{ "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "user", "skillId": 17, "hp_restante": 8255, "dano_causado": 1170, "debuff_aplicado": "Próximo ataque -20%", "escudo_arcano_bloqueou": 292 }, { "nome": "Espelho Mágico", "tipo": "buff", "actor": "opponent", "skillId": 10, "hp_restante": 11896, "reflect_ativo": true, "debuff_reduzir_dano": 214 }], "hpOponente": 8255, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 298, "nome": "Espectro Infernal ", "tipo": "dot" }] }], "buff_aplicado_user": "+50% ataque", "buff_aplicado_opponent": "+50% ataque" }, { "turn": 8, "hpUser": 11636, "actions": [{ "nome": "Julgamento Celestial", "tipo": "especial", "actor": "user", "delayed": "5 turnos", "skillId": 9, "hp_restante": 8255 }, { "nome": "Escudo Arcano", "tipo": "buff", "actor": "opponent", "skillId": 5, "hp_restante": 11636, "escudo_arcano": "3 esferas ativas (20% de redução cada)" }], "hpOponente": 8255, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 9, "hpUser": 10011, "actions": [{ "nome": "Execução", "tipo": "dano", "actor": "user", "skillId": 18, "hp_restante": 7865, "dano_causado": 390, "dano_refletido": 390, "espelho_magico_ativo": true, "escudo_arcano_bloqueou": 195 }, { "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "opponent", "skillId": 17, "hp_restante": 10011, "dano_causado": 975, "debuff_aplicado": "Próximo ataque -20%" }], "hpOponente": 7865, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 10, "hpUser": 9101, "actions": [{ "nome": "Insanidade Explosiva", "tipo": "dano", "actor": "user", "skillId": 21, "hp_restante": 6617, "self_debuff": "Tomará +50% de dano no próximo turno", "dano_causado": 1248, "debuff_reduzir_dano": 130, "escudo_arcano_bloqueou": 312 }, { "tipo": "basic", "actor": "opponent", "bloqueado": false, "hp_restante": 9101, "dano_causado": 650 }], "hpOponente": 6617, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 11, "hpUser": 10141, "actions": [{ "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "user", "skillId": 6, "hp_restante": 6617 }, { "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "opponent", "skillId": 6, "hp_restante": 10141 }], "hpOponente": 7917, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 12, "hpUser": 9881, "actions": [{ "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "user", "skillId": 17, "hp_restante": 6747, "dano_causado": 1170, "debuff_aplicado": "Próximo ataque -20%", "escudo_arcano_bloqueou": 292 }, { "nome": "Espelho Mágico", "tipo": "buff", "actor": "opponent", "skillId": 10, "hp_restante": 9881, "reflect_ativo": true, "debuff_reduzir_dano": 195 }], "hpOponente": 6747, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }], "buff_aplicado_user": "+50% ataque", "buff_aplicado_opponent": "+50% ataque" }, { "turn": 13, "hpUser": 9621, "actions": [{ "nome": "Esquiva Fantasma", "tipo": "buff", "actor": "user", "skillId": 8, "block_ativo": true, "hp_restante": 4797 }, { "tipo": "basic", "actor": "opponent", "bloqueado": true, "hp_restante": 9621, "dano_causado": 0 }], "hpOponente": 4797, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }, { "alvo": "opponent", "efeitos": [{ "dano": 1950, "nome": "Julgamento Celestial", "tipo": "delayed" }] }] }, { "turn": 14, "hpUser": 8874, "actions": [{ "nome": "Execução", "tipo": "dano", "actor": "user", "skillId": 18, "hp_restante": 4309, "dano_causado": 488, "dano_refletido": 487, "espelho_magico_ativo": true }, { "nome": "Escudo Arcano", "tipo": "buff", "actor": "opponent", "skillId": 5, "hp_restante": 8874, "escudo_arcano": "3 esferas ativas (20% de redução cada)" }], "hpOponente": 4309, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 15, "hpUser": 7639, "actions": [{ "nome": "Julgamento Celestial", "tipo": "especial", "actor": "user", "delayed": "5 turnos", "skillId": 9, "hp_restante": 4309 }, { "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "opponent", "skillId": 17, "hp_restante": 7639, "dano_causado": 975, "debuff_aplicado": "Próximo ataque -20%" }], "hpOponente": 4309, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 16, "hpUser": 8679, "actions": [{ "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "user", "skillId": 6, "hp_restante": 4309, "debuff_reduzir_dano": 130 }, { "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "opponent", "skillId": 6, "hp_restante": 8679 }], "hpOponente": 5609, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 17, "hpUser": 8419, "actions": [{ "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "user", "skillId": 17, "hp_restante": 4439, "dano_causado": 1170, "debuff_aplicado": "Próximo ataque -20%", "escudo_arcano_bloqueou": 292 }, { "nome": "Espelho Mágico", "tipo": "buff", "actor": "opponent", "skillId": 10, "hp_restante": 8419, "reflect_ativo": true, "debuff_reduzir_dano": 195 }], "hpOponente": 4439, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }], "buff_aplicado_user": "+50% ataque", "buff_aplicado_opponent": "+50% ataque" }, { "turn": 18, "hpUser": 6729, "actions": [{ "nome": "Insanidade Explosiva", "tipo": "dano", "actor": "user", "skillId": 21, "hp_restante": 3659, "dano_causado": 780, "dano_refletido": 780, "espelho_magico_ativo": true, "escudo_arcano_bloqueou": 390 }, { "tipo": "basic", "actor": "opponent", "bloqueado": false, "hp_restante": 6729, "dano_causado": 650 }], "hpOponente": 3659, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 19, "hpUser": 5819, "actions": [{ "nome": "Execução", "tipo": "dano", "actor": "user", "skillId": 18, "hp_restante": 2359, "dano_causado": 1300, "execucao_ativa": true, "escudo_arcano_bloqueou": 325 }, { "tipo": "basic", "actor": "opponent", "bloqueado": false, "hp_restante": 5819, "dano_causado": 650 }], "hpOponente": 2359, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 20, "hpUser": 5559, "actions": [{ "nome": "Esquiva Fantasma", "tipo": "buff", "actor": "user", "skillId": 8, "block_ativo": true, "hp_restante": 409 }, { "nome": "Escudo Arcano", "tipo": "buff", "actor": "opponent", "skillId": 5, "hp_restante": 5559, "escudo_arcano": "3 esferas ativas (20% de redução cada)" }], "hpOponente": 409, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }, { "alvo": "opponent", "efeitos": [{ "dano": 1950, "nome": "Julgamento Celestial", "tipo": "delayed" }] }] }, { "turn": 21, "hpUser": 6599, "actions": [{ "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "user", "skillId": 6, "hp_restante": 409 }, { "nome": "Espelho Mágico", "tipo": "buff", "actor": "opponent", "skillId": 10, "hp_restante": 6599, "reflect_ativo": true }], "hpOponente": 409, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 22, "hpUser": 5364, "actions": [{ "nome": "Julgamento Celestial", "tipo": "especial", "actor": "user", "delayed": "5 turnos", "skillId": 9, "hp_restante": 409 }, { "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "opponent", "skillId": 17, "hp_restante": 5364, "dano_causado": 975, "debuff_aplicado": "Próximo ataque -20%" }], "hpOponente": 409, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }], "buff_aplicado_user": "+50% ataque" }, { "turn": 23, "hpUser": 4792, "actions": [{ "nome": "Impacto Amaldiçoado", "tipo": "dano", "actor": "user", "skillId": 17, "hp_restante": 97, "dano_causado": 312, "dano_refletido": 312, "debuff_reduzir_dano": 130, "espelho_magico_ativo": true, "escudo_arcano_bloqueou": 156 }, { "cura": 1300, "nome": "Cura Vitalizadora", "tipo": "buff", "actor": "opponent", "skillId": 6, "hp_restante": 4792 }], "hpOponente": 1397, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }, { "turn": 24, "hpUser": 3557, "actions": [{ "nome": "Execução", "tipo": "dano", "actor": "user", "skillId": 18, "hp_restante": 97, "dano_causado": 1300, "execucao_ativa": true, "escudo_arcano_bloqueou": 325 }, { "tipo": "basic", "actor": "opponent", "bloqueado": false, "hp_restante": 3557, "dano_causado": 975 }], "hpOponente": 97, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }], "buff_aplicado_opponent": "+50% ataque" }, { "turn": 25, "hpUser": 3297, "actions": [{ "nome": "Insanidade Explosiva", "tipo": "dano", "actor": "user", "skillId": 21, "hp_restante": -1463, "self_debuff": "Tomará +50% de dano no próximo turno", "dano_causado": 1560, "escudo_arcano_bloqueou": 390 }], "hpOponente": -1463, "status_effects": [{ "alvo": "user", "efeitos": [{ "dano": 260, "nome": "Espectro Infernal ", "tipo": "dot" }] }] }]

export default BattleLog;
