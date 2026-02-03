import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import './SellModal2.css'

export default function SellModal({ isOpen, onClose, item, onConfirm }) {
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (quantidade > 0 && parseFloat(preco) > 0) {
      onConfirm(quantidade, parseFloat(preco));
      setQuantidade(1);
      setPreco('');
      onClose();
    }
  };

  const maxQuantidade = item?.quantidade || 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header-sell">
          <h2 className="modal-title">
            <DollarSign size={24} color='green'/>
            Vender Item
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="sellmodal-item-info">
          <h3 className="sellmodal-item-name">{item?.skill?.name || item?.item?.nome}</h3>
          <p className="sellmodal-item-quantity">
            Disponível: {maxQuantidade}
          </p>
        </div>

        <div className="sellmodal-form-group">
          <label className="sellmodal-form-label">Quantidade</label>
          <input
            type="number"
            min="1"
            max={maxQuantidade}
            value={quantidade}
            onChange={(e) =>
              setQuantidade(Math.min(parseInt(e.target.value) || 1, maxQuantidade))
            }
            className="form-input"
          />
        </div>

        <div className="sellmodal-form-group">
          <label className="sellmodal-form-label">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Taxa de 5% será aplicado na venda."
            className="form-input"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-sell-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-submit" onClick={handleSubmit}>
            Listar no Mercado
          </button>
        </div>

      </div>
    </div>

  );
}