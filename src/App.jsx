import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardSection from './components/DashboardSection';
import ForumsSection from './components/ForumsSection';
import LearningSection from './components/LearningSection';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import Notifications from './components/notifications/Notifications';
import TopicSection from './components/TopicSection';

// ===== MOCK AUTH SERVICE (preparado para API real) =====
const AuthService = {
  // Simula llamada a API de login
  login: async (credentials) => {
    // TODO: Reemplazar con llamada real a API
    // return await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { username, password } = credentials;
        
        // Mock de validación (admin/admin tiene rol admin)
        if (username.toLowerCase() === 'admin' && password === 'admin') {
          resolve({
            success: true,
            user: {
              id: 'user_1',
              username: 'admin',
              email: 'admin@strikeforo.com',
              role: 'admin',
              avatar: null,
              createdAt: new Date().toISOString(),
            },
            token: 'mock_jwt_token_admin_' + Date.now()
          });
        } else if (username && password) {
          // Cualquier otro usuario válido
          resolve({
            success: true,
            user: {
              id: 'user_' + Date.now(),
              username: username,
              email: `${username}@example.com`,
              role: 'user',
              avatar: null,
              createdAt: new Date().toISOString(),
            },
            token: 'mock_jwt_token_' + Date.now()
          });
        } else {
          reject({ message: 'Credenciales inválidas' });
        }
      }, 800); // Simula latencia de red
    });
  },

  // Simula llamada a API de registro
  register: async (userData) => {
    // TODO: Reemplazar con llamada real a API
    // return await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) })
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { username, email } = userData;
        
        // Mock: validar si usuario ya existe
        const existingUsers = JSON.parse(localStorage.getItem('sf_registered_users') || '[]');
        const userExists = existingUsers.some(u => 
          u.username.toLowerCase() === username.toLowerCase() || 
          u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (userExists) {
          reject({ message: 'El usuario o email ya está registrado' });
        } else {
          const newUser = {
            id: 'user_' + Date.now(),
            username,
            email,
            role: 'user',
            avatar: null,
            createdAt: new Date().toISOString(),
          };
          
          // Guardar en mock storage
          existingUsers.push(newUser);
          localStorage.setItem('sf_registered_users', JSON.stringify(existingUsers));
          
          resolve({
            success: true,
            user: newUser,
            token: 'mock_jwt_token_' + Date.now()
          });
        }
      }, 1000);
    });
  },

  // Simula verificación de token
  verifyToken: async (token) => {
    // TODO: Reemplazar con llamada real a API
    // return await fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` }})
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (token && token.startsWith('mock_jwt_token_')) {
          resolve({ valid: true });
        } else {
          resolve({ valid: false });
        }
      }, 300);
    });
  },

  // Simula logout
  logout: async () => {
    // TODO: Reemplazar con llamada real a API
    // return await fetch('/api/auth/logout', { method: 'POST' })
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 200);
    });
  }
};

const App = () => {
  // ===== STATE MANAGEMENT =====
  
  // Auth state con estructura preparada para API
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem('sf_auth_session');
      if (stored) {
        const session = JSON.parse(stored);
        // Verificar si la sesión no ha expirado (ejemplo: 24 horas)
        const expiry = new Date(session.expiresAt);
        if (expiry > new Date()) {
          return session;
        }
      }
    } catch (err) {
      console.error('Error loading auth session:', err);
    }
    return {
      isAuthenticated: false,
      user: null,
      token: null,
      expiresAt: null
    };
  });

  const [currentSection, setCurrentSection] = useState(() => {
    try {
      return localStorage.getItem('sf_current_section') || 'home';
    } catch {
      return 'home';
    }
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ===== PERSISTENCE =====
  
  // Guardar sesión en localStorage
  useEffect(() => {
    try {
      if (auth.isAuthenticated) {
        localStorage.setItem('sf_auth_session', JSON.stringify(auth));
      } else {
        localStorage.removeItem('sf_auth_session');
      }
    } catch (err) {
      console.error('Error saving auth session:', err);
    }
  }, [auth]);

  // Guardar sección actual
  useEffect(() => {
    try {
      localStorage.setItem('sf_current_section', currentSection);
    } catch (err) {
      console.error('Error saving section:', err);
    }
  }, [currentSection]);

  // ===== NOTIFICATIONS =====
  
  const addNotification = useCallback(({ type='info', title='', message='', timeout = 6000 }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    setNotifications(n => [...n, { id, type, title, message }]);
    if (timeout > 0) {
      setTimeout(() => {
        setNotifications(n => n.filter(x => x.id !== id));
      }, timeout);
    }
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(n => n.filter(x => x.id !== id));
  }, []);

  // ===== NAVIGATION =====
  
  const showSection = useCallback((section) => {
    setShowLogin(false);
    setShowRegister(false);

    // Proteger rutas que requieren autenticación
    if (section === 'dashboard' && !auth.isAuthenticated) {
      setShowLogin(true);
      addNotification({
        type: 'warning',
        title: 'Acceso restringido',
        message: 'Debes iniciar sesión para acceder al Dashboard'
      });
      return;
    }
    
    setCurrentSection(section);
  }, [auth.isAuthenticated, addNotification]);

  // ===== AUTH HANDLERS =====
  
  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await AuthService.logout();
      
      setAuth({
        isAuthenticated: false,
        user: null,
        token: null,
        expiresAt: null
      });
      
      setCurrentSection('home');
      
      addNotification({
        type: 'info',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión correctamente'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Hubo un problema al cerrar sesión'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleLogin = useCallback(async (credentials) => {
    setIsLoading(true);
    
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        // Calcular fecha de expiración (24 horas)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        const session = {
          isAuthenticated: true,
          user: response.user,
          token: response.token,
          expiresAt: expiresAt.toISOString()
        };
        
        setAuth(session);
        setShowLogin(false);
        setCurrentSection('dashboard');
        
        addNotification({
          type: 'success',
          title: '¡Bienvenido!',
          message: `Hola ${response.user.username}, sesión iniciada correctamente`
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de inicio de sesión',
        message: error.message || 'No se pudo iniciar sesión. Verifica tus credenciales.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleRegister = useCallback(async (userData) => {
    setIsLoading(true);
    
    try {
      const response = await AuthService.register(userData);
      
      if (response.success) {
        // Calcular fecha de expiración (24 horas)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        const session = {
          isAuthenticated: true,
          user: response.user,
          token: response.token,
          expiresAt: expiresAt.toISOString()
        };
        
        setAuth(session);
        setShowRegister(false);
        setCurrentSection('dashboard');
        
        addNotification({
          type: 'success',
          title: 'Cuenta creada',
          message: `¡Bienvenido ${response.user.username}! Tu cuenta se ha creado exitosamente.`
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error de registro',
        message: error.message || 'No se pudo crear la cuenta. Intenta nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // Verificar token al cargar (preparado para API)
  useEffect(() => {
    const verifySession = async () => {
      if (auth.token) {
        const result = await AuthService.verifyToken(auth.token);
        if (!result.valid) {
          await handleLogout();
          addNotification({
            type: 'warning',
            title: 'Sesión expirada',
            message: 'Por favor, inicia sesión nuevamente'
          });
        }
      }
    };

    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo al montar, las dependencias están manejadas internamente

  const handleUpdateUser = useCallback((updates) => {
    // Actualizar usuario localmente y luego sincronizar con API
    const updatedUser = { ...auth.user, ...updates };
    
    setAuth(prev => ({
      ...prev,
      user: updatedUser
    }));
    
    // TODO: Sincronizar con API
    // await fetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(updates) })
    
    addNotification({
      type: 'success',
      title: 'Perfil actualizado',
      message: 'Tus datos se actualizaron correctamente'
    });
  }, [auth.user, addNotification]);

  // ===== RENDER =====
  
  // Extraer id si la sección es "topic:<id>"
  const isTopicView = currentSection && typeof currentSection === 'string' && currentSection.startsWith('topic:');
  const currentTopicId = isTopicView ? currentSection.split(':')[1] : null;

  return (
    <div>
      <Navbar
        onNavigate={showSection}
        isAuthenticated={auth.isAuthenticated}
        username={auth.user?.username || ''}
        onLogout={handleLogout}
        onShowLogin={() => setShowLogin(true)}
        onShowRegister={() => setShowRegister(true)}
      />

      {currentSection === 'home' && (
        <Hero
          onRegister={() => setShowRegister(true)}
          onNavigate={showSection}
          isAuthenticated={auth.isAuthenticated}
        />
      )}

      {currentSection === 'forums' && (
        <ForumsSection 
          onNotify={addNotification} 
          onNavigate={showSection}
        />
      )}

      {isTopicView && (
        <TopicSection
          currentTopicId={currentTopicId}
          onNavigate={showSection}
          onNotify={addNotification}
          user={auth.user}
        />
      )}

      {currentSection === 'learning' && <LearningSection />}

      {currentSection === 'dashboard' && auth.isAuthenticated && (
        <DashboardSection
          user={auth.user}
          onNavigate={showSection}
          onUpdateUser={handleUpdateUser}
          onNotify={addNotification}
        />
      )}

      <LoginModal 
        show={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={handleLogin} 
        onNotify={addNotification}
        isLoading={isLoading}
      />

      <RegisterModal 
        show={showRegister} 
        onClose={() => setShowRegister(false)} 
        onRegister={handleRegister} 
        onNotify={addNotification}
        isLoading={isLoading}
      />

      <Notifications 
        notifications={notifications} 
        onDismiss={removeNotification} 
      />
    </div>
  );
};

export default App;