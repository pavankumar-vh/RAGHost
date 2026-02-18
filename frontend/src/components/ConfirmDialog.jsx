import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

/**
 * Beautiful confirmation dialog to replace window.confirm and alert
 * 
 * Types:
 * - 'confirm' (default): For yes/no questions
 * - 'alert': For simple notifications
 * - 'warning': For warnings
 * - 'error': For error messages
 * - 'success': For success messages
 */
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'confirm', // 'confirm', 'alert', 'warning', 'error', 'success'
  danger = false // If true, confirm button is red
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && type === 'alert') {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={28} className="text-nb-text" />;
      case 'error':
        return <AlertCircle size={28} className="text-red-600" />;
      case 'success':
        return <CheckCircle size={28} className="text-green-600" />;
      case 'alert':
        return <Info size={28} className="text-nb-blue" />;
      default:
        return <AlertTriangle size={28} className={danger ? 'text-red-600' : 'text-nb-text'} />;
    }
  };

  const getGradientClass = () => {
    switch (type) {
      case 'warning':
        return 'from-amber-500/20 to-orange-500/20 border-amber-500/50';
      case 'error':
        return 'from-red-500/20 to-pink-500/20 border-red-500/50';
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/50';
      case 'alert':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/50';
      default:
        return danger 
          ? 'from-red-500/20 to-pink-500/20 border-red-500/50'
          : 'from-accent-blue/20 to-accent-purple/20 border-accent-blue/50';
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const iconBg = {
    warning: 'bg-nb-yellow',
    error: 'bg-red-100',
    success: 'bg-green-100',
    alert: 'bg-nb-blue/30',
    confirm: danger ? 'bg-red-100' : 'bg-nb-yellow',
  }[type] || 'bg-nb-yellow';

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white border-2 border-black shadow-nb-xl w-full max-w-md p-5 sm:p-8">
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="nb-btn bg-white p-1.5"><X size={18} /></button>
        </div>

        <div className="flex justify-center mb-5">
          <div className={`w-16 h-16 border-2 border-black ${iconBg} flex items-center justify-center`}>
            {getIcon()}
          </div>
        </div>

        {title && <h2 className="text-xl font-bold text-nb-text text-center mb-3">{title}</h2>}
        <p className="text-nb-text text-center mb-5 sm:mb-8 leading-relaxed whitespace-pre-line text-sm">{message}</p>

        <div className={`flex flex-col xs:flex-row gap-2 sm:gap-3 ${type === 'alert' || type === 'success' || type === 'error' ? 'justify-center' : 'justify-end'}`}>
          {(type === 'confirm' || type === 'warning') && (
            <button onClick={onClose} className="nb-btn bg-white px-5 py-2.5">{cancelText}</button>
          )}
          {type === 'confirm' || type === 'warning' ? (
            <button onClick={() => { onConfirm(); onClose(); }}
              className={`nb-btn px-5 py-2.5 ${danger ? 'bg-red-500 text-white border-red-600 hover:bg-red-600' : 'bg-nb-yellow border-black'}`}>
              {confirmText}
            </button>
          ) : (
            <button onClick={onClose}
              className={`nb-btn px-8 py-2.5 ${type === 'success' ? 'bg-green-300 border-black' : type === 'error' ? 'bg-red-500 text-white border-red-600' : 'bg-nb-yellow border-black'}`}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
