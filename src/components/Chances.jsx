import { useState } from "react";
import "./Chances.css";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ChancesModal({ isOpen, onClose }) {
  const [currentRange, setCurrentRange] = useState(0);

  const levelRanges = [
    {
      range: "01-10",
      chances: [77, 20, 2, 0, 0, 1]
    },
    {
      range: "11-20",
      chances: [60, 29, 10, 1, 0, 1]
    },
    {
      range: "21-30",
      chances: [49, 33, 15, 0.7, 0.3, 2]
    },
    {
      range: "31-40",
      chances: [39, 36, 19, 2.5, 1, 3]
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
    { name: "Frasco iniciante", color: "#4caf50"},
    { name: "Frascos iniciantes ", color: "#2196f3"},
    { name: "Frasco Concentrado", color: "#9c27b0"},
    { name: "Frasco da Evolução", color: "#ff9800"},
    { name: "Frasco do Despertar", color: "#f44336"},
    { name: "Magias", color: "#ffd700"}
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
    <div className="chances-modal-overlay" onClick={onClose}>
      <div className="chances-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="chances-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="chances-header">
          <h2>Probabilidades de Loot</h2>
        </div>

        <div className="chances-body">
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
                    <div 
                      style={{ backgroundColor: item.color }}
                    />
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
      </div>
    </div>
  );
}