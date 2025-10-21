import { useState, useRef, useEffect } from 'react';
import { isAdmin } from '../utils/roleUtils';

const Navbar = ({ onNavigate, isAuthenticated, username, user, onLogout, onShowLogin, onShowRegister }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const toggleProfileMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuClick = (action) => {
    setShowProfileMenu(false);
    setMobileMenuOpen(false); // Cerrar menú móvil también
    if (action && typeof action === 'function') {
      try {
        action();
      } catch (error) {
        console.error('Error executing menu action:', error);
      }
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (destination) => {
    setMobileMenuOpen(false);
    if (onNavigate && typeof onNavigate === 'function') {
      try {
        onNavigate(destination);
      } catch (error) {
        console.error('Error navigating:', error);
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <button className="navbar-brand btn btn-link p-0 border-0" onClick={() => handleNavClick('home')}>
          <i className="fas fa-fist-raised" aria-hidden="true"></i>
          <span className="brand-text">StriveForum</span>
        </button>

        <button
          className={`navbar-toggler ${mobileMenuOpen ? 'active' : ''}`}
          type="button"
          onClick={toggleMobileMenu}
          aria-controls="navbarNav"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon">
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </span>
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <button className="nav-link btn btn-link border-0" onClick={() => handleNavClick('home')}>
                <i className="fas fa-home" aria-hidden="true"></i> Inicio
              </button>
            </li>

            <li className="nav-item">
              <button className="nav-link btn btn-link border-0" onClick={() => handleNavClick('forums')}>
                <i className="fas fa-comments" aria-hidden="true"></i> Foros
              </button>
            </li>

            <li className="nav-item">
              <button className="nav-link btn btn-link border-0" onClick={() => handleNavClick('learning')}>
                <i className="fas fa-graduation-cap" aria-hidden="true"></i> Aprender
              </button>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <button className="nav-link btn btn-link border-0" onClick={() => handleNavClick('dashboard')}>
                  <i className="fas fa-tachometer-alt" aria-hidden="true"></i> Dashboard
                </button>
              </li>
            )}

            {isAuthenticated && user && isAdmin(user) && (
              <li className="nav-item">
                <button className="nav-link btn btn-link border-0 admin-nav-link" onClick={() => handleNavClick('admin')}>
                  <i className="fas fa-shield-alt" aria-hidden="true"></i> Admin
                </button>
              </li>
            )}
          </ul>

          <div className="navbar-user">
            {!isAuthenticated ? (
              <div className="auth-buttons">
                <button className="btn btn-secondary" onClick={() => { setMobileMenuOpen(false); onShowLogin(); }}>
                  <i className="fas fa-sign-in-alt" aria-hidden="true"></i>
                  <span>Iniciar Sesión</span>
                </button>
                <button className="btn btn-primary" onClick={() => { setMobileMenuOpen(false); onShowRegister(); }}>
                  <i className="fas fa-user-plus" aria-hidden="true"></i>
                  <span>Registrarse</span>
                </button>
              </div>
            ) : (
              <div className="profile-dropdown" ref={dropdownRef}>
                <button 
                  className={`user-info ${showProfileMenu ? 'active' : ''}`} 
                  onClick={toggleProfileMenu}
                  type="button"
                >
                  <div className="user-avatar">{username ? username[0].toUpperCase() : 'U'}</div>
                  <span className="user-name">{username || 'Usuario'}</span>
                  <i className="fas fa-chevron-down dropdown-arrow"></i>
                </button>

                {showProfileMenu && (
                  <div className="profile-menu show">
                    <div className="profile-menu-header">
                      <div className="user-name">{username || 'Usuario'}</div>
                      <div className="user-email">Miembro activo</div>
                    </div>

                    <button 
                      className="profile-menu-item" 
                      onClick={() => handleMenuClick(() => onNavigate('forums'))}
                    >
                      <i className="fas fa-comments"></i>
                      Foros
                    </button>

                    <button 
                      className="profile-menu-item" 
                      onClick={() => handleMenuClick(() => onNavigate('learning'))}
                    >
                      <i className="fas fa-graduation-cap"></i>
                      Aprender
                    </button>

                    {user && isAdmin(user) && (
                      <>
                        <div className="profile-menu-divider"></div>
                        <button 
                          className="profile-menu-item admin-item" 
                          onClick={() => handleMenuClick(() => onNavigate('admin'))}
                        >
                          <i className="fas fa-shield-alt"></i>
                          Panel de Admin
                        </button>
                      </>
                    )}

                    <div className="profile-menu-divider"></div>

                    <button 
                      className="profile-menu-item danger" 
                      onClick={() => handleMenuClick(onLogout)}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;