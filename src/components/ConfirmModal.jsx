import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import './ConfirmModal.css';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    onConfirm: null
  });

  const showConfirm = (options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Confirmar ação',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'warning',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  return { confirmState, showConfirm };
};

export default function ConfirmModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirmar ação", 
  message = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning" // warning, danger, success
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle size={48} />;
      case 'success':
        return <CheckCircle size={48} />;
      default:
        return <AlertTriangle size={48} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'danger':
        return '#f44336';
      case 'success':
        return '#4caf50';
      default:
        return '#ff9800';
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div 
        className="confirm-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ '--confirm-color': getColor() }}
      >
        <div className="confirm-icon">
          {getIcon()}
        </div>

        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button 
            className="btn-confirm-cancel" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-confirm-action btn-confirm-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}