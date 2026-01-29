import React from 'react';
import './HistoricoSimples.css';

const HistoricoSimples = ({ historico, userId, onClose, onVerLog }) => {
  if (!historico || historico.length === 0) {
    return (
      <div className="historico-overlay-simples" onClick={onClose}>
        <div className="historico-modal-simples" onClick={e => e.stopPropagation()}>
          <div className="historico-header-simples">
            <h2>📜 Histórico de Batalhas</h2>
            <button onClick={onClose}>✕</button>
          </div>
          <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
            Nenhuma batalha encontrada
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="historico-overlay-simples" onClick={onClose}>
      <div className="historico-modal-simples" onClick={e => e.stopPropagation()}>
        <div className="historico-header-simples">
          <h2>📜 Histórico de Batalhas</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="historico-lista-simples">
          {historico.map((batalha) => {
            const euSouJogador1 = batalha.jogador1?.id === userId;
            const oponente = euSouJogador1 ? batalha.jogador2 : batalha.jogador1;
            const vitoria = batalha.vencedor_id === userId;

            return (
              <div 
                key={batalha.id} 
                className={`historico-item-simples ${vitoria ? 'vitoria' : 'derrota'}`}
                onClick={() => onVerLog(batalha.log, oponente)}
              >
                <div className="historico-resultado">
                  {vitoria ? '🏆' : '💀'}
                </div>
                <div className="historico-detalhes">
                  <div className="historico-oponente-nome">
                    vs {oponente?.nome || 'Oponente'}
                  </div>
                  <div className="historico-data">
                    {formatDate(batalha.finalizado_em || batalha.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoricoSimples;