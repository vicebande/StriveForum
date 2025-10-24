import { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardSection from './components/DashboardSection';
import ForumsSection from './components/ForumsSection';
import LearningSection from './components/LearningSection';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import Notifications from './components/notifications/Notifications';
import TopicSection from './components/TopicSection';
import { isUserBlocked } from './utils/roleUtils';
import { 
  registerUser,
  verifyUserCredentials,
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
  getCurrentSection,
  saveCurrentSection
} from './utils/storage';

// ===== UTILITY FUNCTIONS =====
// Función comentada - era para limpiar datos fake
// const clearFakeDataFromLocalStorage = () => {
//   try {
//     localStorage.removeItem('sf_topics');
//     localStorage.removeItem('sf_postsMap');
//     console.log('Fake data cleared from localStorage');
//   } catch (error) {
//     console.warn('Error clearing fake data from localStorage:', error);
//   }
// };

// ===== MOCK AUTH SERVICE (preparado para API real) =====
const AuthService = {
  // Simula llamada a API de login
  login: async (credentials) => {
    // TODO: Reemplazar con llamada real a API
    // return await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { username, password } = credentials;
        
        // Caso especial: admin (no necesita estar registrado)
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
          return;
        }
        
        // Usar función centralizada para verificar credenciales
        const userResult = verifyUserCredentials(username, password);
        
        if (!userResult.success) {
          reject({ message: userResult.message });
          return;
        }
        
        // Login exitoso para usuario registrado
        resolve({
          success: true,
          user: userResult.user,
          token: 'mock_jwt_token_' + Date.now()
        });
      }, 800); // Simula latencia de red
    });
  },

  // Simula llamada a API de registro
  register: async (userData) => {
    // TODO: Reemplazar con llamada real a API
    // return await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) })
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Usar función centralizada de storage
        const result = registerUser(userData);
        
        if (result.success) {
          resolve({
            success: true,
            user: result.user,
            token: 'mock_jwt_token_' + Date.now()
          });
        } else {
          reject({ message: result.error });
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
    // Usar función centralizada de storage
    return getAuthSession() || {
      isAuthenticated: false,
      user: null,
      token: null,
      expiresAt: null
    };
  });

  const [currentSection, setCurrentSection] = useState(() => {
    // Usar función centralizada de storage
    return getCurrentSection();
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ===== INITIALIZATION =====
  
  // Clear fake data on app startup
  useEffect(() => {
    // clearFakeDataFromLocalStorage(); // COMENTADO: Esto borraba los datos al recargar
    console.log('🚀 App initialized - NOT clearing localStorage data');
  }, []); // Run only once on app startup

  // ===== PERSISTENCE =====
  
  // Guardar sesión en localStorage
  // Guardar sesión en localStorage
  useEffect(() => {
    if (auth.isAuthenticated) {
      saveAuthSession(auth);
    } else {
      clearAuthSession();
    }
  }, [auth]);

  // Guardar sección actual
  useEffect(() => {
    saveCurrentSection(currentSection);
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
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Hubo un problema al cerrar sesión'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // ===== NAVIGATION =====
  
  const showSection = useCallback((section) => {
    try {
      setShowLogin(false);
      setShowRegister(false);

      // Validar el parámetro de sección
      if (!section || typeof section !== 'string') {
        console.error('Invalid section parameter:', section);
        setCurrentSection('home');
        return;
      }

      // Proteger rutas que requieren autenticación
      if ((section === 'dashboard' || section === 'admin') && !auth.isAuthenticated) {
        setShowLogin(true);
        addNotification({
          type: 'warning',
          title: 'Acceso restringido',
          message: 'Debes iniciar sesión para acceder a esta sección'
        });
        return;
      }

      // Verificar si el usuario está bloqueado al intentar navegar
      if (auth.isAuthenticated && auth.user && isUserBlocked(auth.user.username)) {
        // Cerrar sesión automáticamente si está bloqueado
        handleLogout();
        addNotification({
          type: 'error',
          title: 'Cuenta suspendida',
          message: 'Tu cuenta ha sido suspendida. Has sido desconectado automáticamente.'
        });
        return;
      }
      
      // Validar formato de topic
      if (section.startsWith('topic:')) {
        const topicId = section.split(':')[1];
        if (!topicId || topicId.trim() === '') {
          console.error('Invalid topic ID:', topicId);
          setCurrentSection('forums');
          addNotification({
            type: 'error',
            title: 'Error de navegación',
            message: 'ID de topic inválido'
          });
          return;
        }
      }
      
      setCurrentSection(section);
    } catch (error) {
      console.error('Error in showSection:', error);
      setCurrentSection('home');
      addNotification({
        type: 'error',
        title: 'Error de navegación',
        message: 'Ha ocurrido un error. Regresando al inicio.'
      });
    }
  }, [auth.isAuthenticated, auth.user, addNotification, handleLogout]);

  const handleLogin = useCallback(async (credentials) => {
    setIsLoading(true);
    
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        // Verificar si el usuario está bloqueado
        if (isUserBlocked(response.user.username)) {
          addNotification({
            type: 'error',
            title: 'Cuenta bloqueada',
            message: 'Tu cuenta ha sido suspendida. Contacta a los administradores para más información.'
          });
          setIsLoading(false);
          return;
        }

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
        // Verificar si el usuario está bloqueado (en caso de que se bloquee durante el registro)
        if (isUserBlocked(response.user.username)) {
          addNotification({
            type: 'error',
            title: 'Cuenta bloqueada',
            message: 'Esta cuenta ha sido suspendida. Contacta a los administradores.'
          });
          setIsLoading(false);
          return;
        }

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
        user={auth.user}
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

      {currentSection === 'admin' && auth.isAuthenticated && (
        <AdminPanel
          user={auth.user}
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