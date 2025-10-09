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
        return <AlertTriangle size={48} className="text-amber-400" />;
      case 'error':
        return <AlertCircle size={48} className="text-red-400" />;
      case 'success':
        return <CheckCircle size={48} className="text-green-400" />;
      case 'alert':
        return <Info size={48} className="text-blue-400" />;
      default:
        return <AlertTriangle size={48} className={danger ? "text-red-400" : "text-accent-blue"} />;
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

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-gradient-to-br from-gray-900 to-black border rounded-2xl p-8 w-full max-w-md shadow-2xl animate-slideIn">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass()} rounded-2xl pointer-events-none`}></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all duration-200 z-10 group"
          aria-label="Close"
        >
          <X size={20} className="text-gray-400 group-hover:text-white transition-colors" />
        </button>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gray-800/50 rounded-full backdrop-blur-sm">
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          {title && (
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              {title}
            </h2>
          )}

          {/* Message */}
          <p className="text-gray-100 text-center mb-8 leading-relaxed whitespace-pre-line">
            {message}
          </p>

          {/* Buttons */}
          <div className={`flex gap-3 ${type === 'alert' || type === 'success' || type === 'error' ? 'justify-center' : 'justify-end'}`}>
            {(type === 'confirm' || type === 'warning') && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {cancelText}
              </button>
            )}
            
            {type === 'confirm' || type === 'warning' ? (
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-6 py-3 ${
                  danger 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                    : 'bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90'
                } text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg`}
              >
                {confirmText}
              </button>
            ) : (
              <button
                onClick={onClose}
                className={`px-8 py-3 ${
                  type === 'success' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                    : type === 'error'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                    : 'bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90'
                } text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg`}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
