import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Notifications = ({ notifications = [], onDismiss }) => {
  // Validar que notifications sea un array
  if (!Array.isArray(notifications)) {
    console.warn('Notifications: notifications prop should be an array');
    return null;
  }

  // Usar portal para renderizar todas las notificaciones simultáneamente
  return createPortal(
    <div className="notifications-container">
      {notifications.map(notif => {
        if (!notif || !notif.id) {
          console.warn('Invalid notification object:', notif);
          return null;
        }
        return (
          <Notification key={notif.id} notification={notif} onDismiss={onDismiss} />
        );
      })}
    </div>,
    document.body
  );
};

const Notification = ({ notification, onDismiss }) => {
  const { id, type = 'info', title = '', message = '' } = notification || {};

  useEffect(() => {
    if (id && typeof onDismiss === 'function') {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [id, onDismiss]);

  // Validar que la notificación tenga ID después de los hooks
  if (!id) {
    console.warn('Notification missing ID:', notification);
    return null;
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
      default:
        return 'fa-info-circle';
    }
  };

  const handleClose = () => {
    onDismiss(id);
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        <i className={`fas ${getIcon()}`}></i>
      </div>
      <div className="notification-content">
        {title && <div className="notification-title">{title}</div>}
        {message && <div className="notification-message">{message}</div>}
      </div>
      <button className="notification-close" onClick={handleClose} aria-label="Cerrar">
        <i className="fas fa-times"></i>
      </button>
      <div className="notification-progress"></div>
    </div>
  );
};

export default Notifications;