import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import MobileNavModal from './components/modals/MobileNavModal';
import Hero from './components/Hero';
import HomeSection from './components/HomeSection';
import DashboardSection from './components/DashboardSection';
import ForumsSection from './components/ForumsSection';
import MatchmakingSection from './components/MatchmakingSection';
import LearningSection from './components/LearningSection';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import UserMenuModal from './components/modals/UserMenuModal';
import Notifications from './components/notifications/Notifications';
import TopicSection from './components/TopicSection';

const App = () => {
  // recuperar desde localStorage si existe
  const getInitialAuth = () => {
    try {
      const raw = localStorage.getItem('sf_auth');
      return raw ? JSON.parse(raw) : { isAuthenticated: false, username: '', email: '', createdAt: null };
    } catch (err) {
      console.error('Error parsing auth from localStorage', err);
      return { isAuthenticated: false, username: '', email: '', createdAt: null };
    }
  };

  const [currentSection, setCurrentSection] = useState(() => {
    try {
      return localStorage.getItem('sf_currentSection') || 'home';
    } catch {
      return 'home';
    }
  });

  // auth ahora guarda usuario completo (persistido)
  const [auth, setAuth] = useState(() => getInitialAuth());

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userMenuRect, setUserMenuRect] = useState(null);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // lista simulada de usuarios existentes (para validaciones de unicidad), persistida
  const [existingUsernames, setExistingUsernames] = useState(() => {
    try {
      const raw = localStorage.getItem('sf_usernames');
      return raw ? JSON.parse(raw) : ['existente','otro'];
    } catch (err) {
      console.error('Error parsing usernames from localStorage', err);
      return ['existente','otro'];
    }
  });

  // notifications state
  const [notifications, setNotifications] = useState([]);

  // persistir cambios importantes en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sf_auth', JSON.stringify(auth));
    } catch (err) {
      console.error('Error saving auth to localStorage', err);
    }
  }, [auth]);

  useEffect(() => {
    try {
      localStorage.setItem('sf_currentSection', currentSection);
    } catch (err) {
      console.error('Error saving section to localStorage', err);
    }
  }, [currentSection]);

  useEffect(() => {
    try {
      localStorage.setItem('sf_usernames', JSON.stringify(existingUsernames));
    } catch (err) {
      console.error('Error saving usernames to localStorage', err);
    }
  }, [existingUsernames]);

  const addNotification = useCallback(({ type='info', title='', message='', timeout = 6000 }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    setNotifications(n => [...n, { id, type, title, message }]);
    if (timeout > 0) {
      setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), timeout);
    }
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(n => n.filter(x => x.id !== id));
  }, []);

  const showSection = (section) => {
    setShowLogin(false);
    setShowRegister(false);
    setShowUserMenu(false);
    setUserMenuRect(null);
    setShowMobileNav(false);

    if (section === 'dashboard' && !auth.isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setCurrentSection(section);
  };

  const handleLogin = (username) => {
    // demo: iniciar sesión con email ficticio y fecha de creación simulada
    const user = { isAuthenticated: true, username, email: `${username}@example.com`, createdAt: new Date().toISOString() };
    setAuth(user);
    setShowLogin(false);
    setCurrentSection('dashboard');
    addNotification({ type: 'success', title: 'Bienvenido', message: `Bienvenido, ${username}` });
    // asegurarnos que username esté en la lista
    setExistingUsernames(prev => prev.includes(username.toLowerCase()) ? prev : [...prev, username.toLowerCase()]);
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, username: '', email: '', createdAt: null });
    setShowUserMenu(false);
    setUserMenuRect(null);
    setCurrentSection('home');
    addNotification({ type: 'info', title: 'Sesión cerrada', message: 'Has cerrado sesión.' });
  };

  const handleRegister = (userData) => {
    // demo: crear cuenta y logear
    const user = { isAuthenticated: true, username: userData.username, email: userData.email, createdAt: new Date().toISOString() };
    setAuth(user);
    setShowRegister(false);
    setCurrentSection('dashboard');
    addNotification({ type: 'success', title: 'Cuenta creada', message: `Bienvenido, ${userData.username}` });
    setExistingUsernames(prev => prev.includes(userData.username.toLowerCase()) ? prev : [...prev, userData.username.toLowerCase()]);
  };

  // actualizar usuario (usado por edición de perfil en Dashboard)
  const handleUpdateUser = (updated) => {
    setAuth(prev => ({ ...prev, ...updated }));
    // actualizar lista de usernames si cambió (simulación)
    if (updated.username) {
      setExistingUsernames(prev => prev.includes(updated.username.toLowerCase()) ? prev : [...prev, updated.username.toLowerCase()]);
    }
    addNotification({ type: 'success', title: 'Perfil actualizado', message: 'Tus datos se actualizaron correctamente.' });
  };

  // extraer id si la sección es "topic:<id>"
  const isTopicView = currentSection && typeof currentSection === 'string' && currentSection.startsWith('topic:');
  const currentTopicId = isTopicView ? currentSection.split(':')[1] : null;

  return (
    <div>
      <Navbar
        onNavigate={showSection}
        isAuthenticated={auth.isAuthenticated}
        username={auth.username}
        onLogout={handleLogout}
        onShowLogin={() => setShowLogin(true)}
        onShowRegister={() => setShowRegister(true)}
        onShowUserMenu={(rect) => { setUserMenuRect(rect); setShowUserMenu(true); }}
        onShowMobileMenu={() => setShowMobileNav(true)}
      />

      {currentSection === 'home' && (
        <Hero
          onRegister={() => setShowRegister(true)}
          onNavigate={showSection}
          isAuthenticated={auth.isAuthenticated}
        />
      )}

      {currentSection === 'forums' && <ForumsSection onNotify={addNotification} onNavigate={showSection} />}

      {isTopicView && (
        <TopicSection
          currentTopicId={currentTopicId}
          onNavigate={showSection}
          onNotify={addNotification}
          user={auth}
        />
      )}

      {currentSection === 'matchmaking' && <MatchmakingSection />}

      {currentSection === 'learning' && <LearningSection />}

      {currentSection === 'dashboard' && auth.isAuthenticated && (
        <DashboardSection
          user={auth}
          onNavigate={showSection}
          onUpdateUser={handleUpdateUser}
          existingUsernames={existingUsernames}
          onNotify={addNotification}
        />
      )}

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} onNotify={addNotification} />
      <RegisterModal show={showRegister} onClose={() => setShowRegister(false)} onRegister={handleRegister} onNotify={addNotification} />
      <UserMenuModal
        show={showUserMenu}
        rect={userMenuRect}
        onClose={() => { setShowUserMenu(false); setUserMenuRect(null); }}
        onNavigate={(s) => showSection(s)}
        onLogout={handleLogout}
      />
      <MobileNavModal show={showMobileNav} onClose={() => setShowMobileNav(false)} onNavigate={showSection} isAuthenticated={auth.isAuthenticated} />

      <Notifications notifications={notifications} onDismiss={removeNotification} />
    </div>
  );
};

export default App;