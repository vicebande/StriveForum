import React from 'react';

const UserMenuModal = ({ show, rect, onClose, onNavigate, onLogout }) => {
  if (!show || !rect) return null;

  // dimensiones/offsets
  const modalWidth = 260;
  const gutter = 8;
  const top = rect.bottom + window.scrollY + 6; // justo debajo del botón
  // posicionar para que el borde derecho del modal coincida con el borde derecho del botón
  let left = rect.right + window.scrollX - modalWidth;
  // asegurar que no salga de la pantalla
  left = Math.max(gutter, Math.min(left, window.innerWidth - modalWidth - gutter));

  const style = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    maxWidth: modalWidth,
    zIndex: 1200,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
  };

  const handleNav = (s) => {
    onClose();
    onNavigate(s);
  };

  return (
    <div className="rf-modal-backdrop" onMouseDown={onClose}>
      <div className="rf-modal" onMouseDown={(e) => e.stopPropagation()} style={style}>
        <div className="rf-modal-header">
          <h6>Usuario</h6>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>
        <div className="rf-modal-body">
          <div className="list-group">
            <button className="list-group-item list-group-item-action" onClick={() => handleNav('dashboard')}>
              <i className="fas fa-tachometer-alt me-2"></i> Dashboard
            </button>
            <button className="list-group-item list-group-item-action" onClick={() => handleNav('forums')}>
              <i className="fas fa-comments me-2"></i> Foros
            </button>
            <button className="list-group-item list-group-item-action" onClick={() => handleNav('matchmaking')}>
              <i className="fas fa-gamepad me-2"></i> Matchmaking
            </button>
            <button className="list-group-item list-group-item-action" onClick={() => onLogout()}>
              <i className="fas fa-sign-out-alt me-2"></i> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMenuModal;