import React from 'react';
import { AlertTriangle, CheckCircle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info', // info, success, danger, warning
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={40} color="var(--success)" />;
      case 'danger':
        return <Trash2 size={40} color="var(--danger)" />;
      case 'warning':
        return <AlertTriangle size={40} color="var(--warning)" />;
      default:
        return <AlertTriangle size={40} color="var(--primary)" />;
    }
  };

  const getConfirmStyle = () => {
    switch (type) {
      case 'danger':
        return { backgroundColor: 'var(--danger)', color: '#fff' };
      case 'success':
        return { backgroundColor: 'var(--success)', color: '#fff' };
      case 'warning':
        return { backgroundColor: 'var(--warning)', color: '#fff' };
      default:
        return { backgroundColor: 'var(--primary)', color: '#fff' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-md)',
        width: '90%',
        maxWidth: '400px',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
          {getIcon()}
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{message}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn"
            style={{ ...getConfirmStyle(), flex: 1, justifyContent: 'center' }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
