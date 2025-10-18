import React from 'react';

const Navbar = ({ onNavigate, isAuthenticated, username, onLogout, onShowLogin, onShowRegister, onShowUserMenu, onShowMobileMenu }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
          <i className="fas fa-fist-raised" aria-hidden="true"></i>
          <span>StriveForum</span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir navegación"
          onClick={(e) => { e.preventDefault(); if (onShowMobileMenu) onShowMobileMenu(); }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={(e)=>{e.preventDefault(); onNavigate('home');}}>
                <i className="fas fa-home me-2" aria-hidden="true"></i> Inicio
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#" onClick={(e)=>{e.preventDefault(); onNavigate('forums');}}>
                <i className="fas fa-comments me-2" aria-hidden="true"></i> Foros
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#" onClick={(e)=>{e.preventDefault(); onNavigate('matchmaking');}}>
                <i className="fas fa-gamepad me-2" aria-hidden="true"></i> Matchmaking
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#" onClick={(e)=>{e.preventDefault(); onNavigate('learning');}}>
                <i className="fas fa-graduation-cap me-2" aria-hidden="true"></i> Aprender
              </a>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={(e)=>{e.preventDefault(); onNavigate('dashboard');}}>
                  <i className="fas fa-tachometer-alt me-2" aria-hidden="true"></i> Dashboard
                </a>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            {!isAuthenticated ? (
              <li className="nav-item d-flex gap-2">
                <button className="btn btn-secondary me-2" onClick={onShowLogin}><i className="fas fa-sign-in-alt me-1" aria-hidden="true"></i> Iniciar Sesión</button>
                <button className="btn btn-primary" onClick={onShowRegister}><i className="fas fa-user-plus me-1" aria-hidden="true"></i> Registrarse</button>
              </li>
            ) : (
              <li className="nav-item d-flex align-items-center gap-2">
                <button
                  className="btn btn-link nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    onShowUserMenu(rect);
                  }}
                >
                  <i className="fas fa-user me-1" aria-hidden="true"></i> {username}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;