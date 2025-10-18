import React from 'react';

const MobileNavModal = ({ show, onClose, onNavigate, isAuthenticated }) => {
  if (!show) return null;

  const handleNav = (s) => {
    onClose();
    onNavigate(s);
  };

  return (
    <div className="rf-modal-backdrop" onMouseDown={onClose}>
      <div
        className="mobile-nav-modal rf-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mobile-nav-header">
          <h5 style={{ margin: 0 }}>Navegación</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>

        <div className="mobile-nav-body">
          <button className="mobile-nav-item" onClick={() => handleNav('home')}>
            <i className="fas fa-home me-2" /> Inicio
          </button>
          <button className="mobile-nav-item" onClick={() => handleNav('forums')}>
            <i className="fas fa-comments me-2" /> Foros
          </button>
          <button className="mobile-nav-item" onClick={() => handleNav('matchmaking')}>
            <i className="fas fa-gamepad me-2" /> Matchmaking
          </button>
          <button className="mobile-nav-item" onClick={() => handleNav('learning')}>
            <i className="fas fa-graduation-cap me-2" /> Aprender
          </button>

          {isAuthenticated ? (
            <>
              <hr className="mobile-nav-sep" />
              <button className="mobile-nav-item" onClick={() => handleNav('dashboard')}>
                <i className="fas fa-tachometer-alt me-2" /> Dashboard
              </button>
              <button className="mobile-nav-item" onClick={() => { onClose(); }}>
                <i className="fas fa-user me-2" /> Perfil
              </button>
            </>
          ) : (
            <>
              <hr className="mobile-nav-sep" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary flex-1" onClick={() => { onClose(); onNavigate('home'); }}>Registrarse</button>
                <button className="btn btn-secondary flex-1" onClick={() => { onClose(); onNavigate('home'); }}>Iniciar sesión</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNavModal;