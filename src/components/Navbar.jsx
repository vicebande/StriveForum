import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../utils/roleUtils';

const Navbar = ({ user, onLogout, onShowLogin, onShowRegister }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Función para determinar si una ruta está activa
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-fist-raised" aria-hidden="true"></i>
          <span className="brand-text">StriveForum</span>
        </Link>

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
              <Link 
                to="/" 
                className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-home" aria-hidden="true"></i> Inicio
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/forums" 
                className={`nav-link ${isActiveRoute('/forums') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-comments" aria-hidden="true"></i> Foros
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/learning" 
                className={`nav-link ${isActiveRoute('/learning') ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-graduation-cap" aria-hidden="true"></i> Aprender
              </Link>
            </li>

            {user && (
              <li className="nav-item">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <i className="fas fa-tachometer-alt" aria-hidden="true"></i> Dashboard
                </Link>
              </li>
            )}

            {user && isAdmin(user) && (
              <li className="nav-item">
                <Link 
                  to="/admin" 
                  className={`nav-link admin-nav-link ${isActiveRoute('/admin') ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <i className="fas fa-shield-alt" aria-hidden="true"></i> Admin
                </Link>
              </li>
            )}
          </ul>

          <div className="navbar-user">
            {!user ? (
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
                  <div className="user-avatar">{user?.username ? user.username[0].toUpperCase() : 'U'}</div>
                  <span className="user-name">{user?.username || 'Usuario'}</span>
                  <i className="fas fa-chevron-down dropdown-arrow"></i>
                </button>

                {showProfileMenu && (
                  <div className="profile-menu show">
                    <div className="profile-menu-header">
                      <div className="user-name">{user?.username || 'Usuario'}</div>
                      <div className="user-email">{user?.email || 'Miembro activo'}</div>
                    </div>

                    <Link 
                      to="/forums"
                      className="profile-menu-item" 
                      onClick={() => handleMenuClick()}
                    >
                      <i className="fas fa-comments"></i>
                      Foros
                    </Link>

                    <Link 
                      to="/learning"
                      className="profile-menu-item" 
                      onClick={() => handleMenuClick()}
                    >
                      <i className="fas fa-graduation-cap"></i>
                      Aprender
                    </Link>

                    {user && isAdmin(user) && (
                      <>
                        <div className="profile-menu-divider"></div>
                        <Link 
                          to="/admin"
                          className="profile-menu-item admin-item" 
                          onClick={() => handleMenuClick()}
                        >
                          <i className="fas fa-shield-alt"></i>
                          Panel de Admin
                        </Link>
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