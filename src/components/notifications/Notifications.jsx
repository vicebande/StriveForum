import React, { useEffect } from 'react';

const Notifications = ({ notifications, onDismiss }) => {
  useEffect(() => {
    // opcional: limpiar si no hay notifs
  }, [notifications]);

  return (
    <div className="notifications-container" aria-live="polite" aria-atomic="true">
      {notifications.map(n => (
        <div key={n.id} className={`notif notif-${n.type || 'info'}`} role="status">
          <div className="notif-body">
            <strong className="notif-title">{n.title}</strong>
            <div className="notif-msg">{n.message}</div>
          </div>
          <button className="notif-close" onClick={() => onDismiss(n.id)} aria-label="Cerrar">&times;</button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;