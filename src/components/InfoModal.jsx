import { useState } from "react";
import "./InfoModal.css";
import { X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";

export default function InfoModal({ isOpen, onClose }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [currentRange, setCurrentRange] = useState(0);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Dados das probabilidades
  const levelRanges = [
    {
      range: "01-10",
      chances: [77, 20, 2, 0, 0, 1]
    },
    {
      range: "11-20",
      chances: [59, 29, 10, 1, 0, 1]
    },
    {
      range: "21-30",
      chances: [49, 33, 15, 0.7, 0.3, 2]
    },
    {
      range: "31-40",
      chances: [39, 36, 18.5, 2.5, 1, 3]
    },
    {
      range: "41-50",
      chances: [28, 41, 23, 3, 1.5, 3.5]
    },
    {
      range: "51-60",
      chances: [20, 39, 29.5, 5, 2.5, 4]
    }
  ];

  const items = [
    { name: "Frasco iniciante", color: "#4caf50" },
    { name: "Frascos iniciantes ", color: "#2196f3" },
    { name: "Frasco Concentrado", color: "#9c27b0" },
    { name: "Frasco da Evolução", color: "#ff9800" },
    { name: "Frasco do Despertar", color: "#f44336" },
    { name: "Magias", color: "#ffd700" }
  ];

  const currentData = levelRanges[currentRange];

  const handlePrevious = () => {
    setCurrentRange((prev) => (prev === 0 ? levelRanges.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentRange((prev) => (prev === levelRanges.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <h2>Informações</h2>
          <button className="info-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="info-modal-body">
          {/* Seção: Sobre o Projeto */}
          <div className="info-section">
            <button
              className="info-section-header"
              onClick={() => toggleSection('about')}
            >
              <span>Sobre o Projeto</span>
              {expandedSection === 'about' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === 'about' && (
              <div className="info-section-content">
                <p>Nada de Pay To Win, nada de indicados só para criadores de conteúdos ganharem, nem horas em frente ao pc para ganhar centavos.</p>
                <p>Minha ideia com esse projeto é ser algo simples, que não tome tempo. Farm fácil, torneios rápidos, preços acessíveis.</p>
                <p>O "farm" é gratuito, e tudo pode ser listado no mercado para vender para outros jogadores. Farme frascos de experiências para subir de nível
                  (máximo 60) e, talvez, conseguir habilidades para poder batalhar nos duelos pvp. </p>
              </div>
            )}
          </div>

          {/* Seção: Duelos e Batalhas*/}
          <div className="info-section">
            <button
              className="info-section-header"
              onClick={() => toggleSection('howto')}
            >
              <span>Funcionamento das batalhas</span>
              {expandedSection === 'howto' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === 'howto' && (
              <div className="info-section-content">
                <p> As batalhas são automáticas. Cada turno um jogador usa uma habilidade previamente equipada (se não houver nenhuma disponível o usuário realiza um auto ataque).</p>
                <p>A escolha de quem ataca primeiro é aleatória (50%), em builds bem pensadas quem ataca primeiro pode ter vantagem.</p>
                <p>Seu Nível influencia vida e dano de ataque, o que pode ser decisivo nas batalhas, pois magias usam dano de ataque como base para infligir dano ao oponente.</p>
              </div>
            )}
          </div>

          {/* Seção: Probabilidades de Loot */}
          <div className="info-section">
            <button
              className="info-section-header"
              onClick={() => toggleSection('chances')}
            >
              <span>Probabilidades de Loot</span>
              {expandedSection === 'chances' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === 'chances' && (
              <div className="info-section-content">
                {/* Controles de navegação */}
                <div className="chances-navigation">
                  <button onClick={handlePrevious} className="btn-nav">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="chances-level-display">
                    <span className="level-label">Níveis</span>
                    <span className="level-range">{currentData.range}</span>
                  </div>
                  <button onClick={handleNext} className="btn-nav">
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Lista de itens com probabilidades */}
                <div className="chances-list">
                  {items.map((item, index) => {
                    const chance = currentData.chances[index];

                    return (
                      <div key={index} className="chance-item">
                        <div className="chance-item-info">
                          <span className="chance-item-name">{item.name}</span>
                        </div>

                        <div className="chance-item-percentage">
                          <div className="chance-bar-container">
                            <div
                              className="chance-bar-fill"
                              style={{
                                width: `${chance}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                          <span className="chance-value">
                            {chance}<span className="chance-symbol">%</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Indicadores de paginação */}
                <div className="chances-pagination">
                  {levelRanges.map((range, index) => (
                    <button
                      key={index}
                      className={`pagination-dot ${index === currentRange ? 'active' : ''}`}
                      onClick={() => setCurrentRange(index)}
                      title={`Níveis ${range.range}`}
                    />
                  ))}
                </div>

                {/* Informações adicionais */}
                <div className="chances-info">
                  <p>🎲 Chance de vir qualquer uma das 18 magias é a mesma.</p>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Como Jogar - Exemplo de nova seção */}
          <div className="info-section">
            <button
              className="info-section-header"
              onClick={() => toggleSection('contato')}
            >
              <span>Contato</span>
              {expandedSection === 'contato' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSection === 'contato' && (
              <div className="info-section-content">
                <p>Telegram: <a className="contato" href="https://t.me/+0R6rVBsv6IliZDQx"
                  target="_blank" rel="noopener noreferrer">Entrar no grupo.</a></p>
                <p>E-mail: mageprotocol.jogo@gmail.com</p>



              </div>
            )}
          </div>

          {/* Seção: Versão */}
          <div className="info-version">
            <p>Versão 1.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}