import React, { useEffect } from 'react';

const Notifications = ({ notifications, onDismiss }) => {
  return (
    <div className="notifications-container">
      {notifications.map(notif => (
        <Notification key={notif.id} notification={notif} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const Notification = ({ notification, onDismiss }) => {
  const { id, type, title, message } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

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