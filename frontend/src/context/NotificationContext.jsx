import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle2 size={20} className="flex-shrink-0" />,
    error: <XCircle size={20} className="flex-shrink-0" />,
    warning: <AlertTriangle size={20} className="flex-shrink-0" />,
    info: <Info size={20} className="flex-shrink-0" />,
  };

  const styles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  return (
    <div
      className={`${styles[notification.type]} border rounded-xl p-4 mb-3 shadow-lg animate-slideIn flex items-start gap-3 max-w-md`}
    >
      {icons[notification.type]}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="font-semibold mb-1">{notification.title}</h4>
        )}
        <p className="text-sm opacity-90 break-words">{notification.message}</p>
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="mt-2 text-sm font-semibold underline hover:no-underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = { id, ...notification };
    
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showSuccess = useCallback((message, title, options = {}) => {
    return addNotification({ type: 'success', message, title, ...options });
  }, [addNotification]);

  const showError = useCallback((message, title, options = {}) => {
    return addNotification({ 
      type: 'error', 
      message, 
      title: title || 'Error', 
      duration: options.duration || 8000, // Errors stay longer
      ...options 
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title, options = {}) => {
    return addNotification({ type: 'warning', message, title, ...options });
  }, [addNotification]);

  const showInfo = useCallback((message, title, options = {}) => {
    return addNotification({ type: 'info', message, title, ...options });
  }, [addNotification]);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <div className="pointer-events-auto">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={removeNotification}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};
