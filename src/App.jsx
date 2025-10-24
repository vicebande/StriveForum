import { useState, useCallback, useEffect } from 'react';
import AppRouter from './components/AppRouter';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import { isUserBlocked } from './utils/roleUtils';
import { 
  registerUser,
  verifyUserCredentials,
  getAuthSession,
  saveAuthSession,
  clearAuthSession
} from './utils/storage';

// ===== MOCK AUTH SERVICE (preparado para API real) =====
const AuthService = {
  // Simula llamada a API de login
  login: async (credentials) => {
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
    return new Promise((resolve) => {
      setTimeout(() => {
        if (token && token.includes('mock_jwt_token')) {
          resolve({ 
            success: true, 
            user: { 
              id: 'user_1', 
              username: 'validated_user',
              role: 'user'
            } 
          });
        } else {
          resolve({ success: false });
        }
      }, 500);
    });
  },

  // Simula logout
  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  }
};

// ===== MAIN APP COMPONENT =====
function App() {
  // Estados principales
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para agregar notificaciones
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  // Manejador de errores globales
  useEffect(() => {
    const handleUnhandledError = (event) => {
      console.error('Unhandled error:', event.error);
      addNotification({
        type: 'error',
        title: 'Error inesperado',
        message: 'Ha ocurrido un error inesperado. Por favor, recarga la página.'
      });
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: 'Problema de conexión. Verifica tu internet e inténtalo de nuevo.'
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addNotification]);

  // ===== AUTHENTICATION HANDLERS =====
  const handleLogin = useCallback(async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        // Verificar si el usuario no está bloqueado
        if (isUserBlocked(response.user.username)) {
          throw new Error('Tu cuenta ha sido bloqueada. Contacta al administrador.');
        }

        setUser(response.user);
        
        // Guardar sesión en localStorage con tiempo de expiración
        const sessionData = {
          user: response.user,
          token: response.token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        };
        saveAuthSession(sessionData);
        
        setShowLoginModal(false);
        
        // Mostrar notificación de bienvenida
        addNotification({
          type: 'success',
          title: 'Bienvenido',
          message: `¡Hola ${response.user.username}! Has iniciado sesión correctamente.`
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Mostrar notificación de error de login
      addNotification({
        type: 'error',
        title: 'Error de inicio de sesión',
        message: error.message || 'No se pudo iniciar sesión. Verifica tus credenciales.'
      });
      
      throw error;
    }
  }, [addNotification]);

  const handleRegister = useCallback(async (userData) => {
    try {
      const response = await AuthService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        
        // Guardar sesión
        const sessionData = {
          user: response.user,
          token: response.token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        saveAuthSession(sessionData);
        
        setShowRegisterModal(false);
        
        // Mostrar notificación de bienvenida para nuevo usuario
        addNotification({
          type: 'success',
          title: '¡Cuenta creada!',
          message: `¡Bienvenido ${response.user.username}! Tu cuenta ha sido creada exitosamente.`
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }, [addNotification]);

  const handleLogout = useCallback(async () => {
    try {
      const currentUsername = user?.username;
      await AuthService.logout();
      setUser(null);
      clearAuthSession();
      
      // Mostrar notificación de despedida
      addNotification({
        type: 'info',
        title: 'Sesión cerrada',
        message: `¡Hasta luego${currentUsername ? ' ' + currentUsername : ''}! Has cerrado sesión correctamente.`
      });
    } catch (error) {
      console.error('Logout error:', error);
      
      // Mostrar notificación de error de logout
      addNotification({
        type: 'error',
        title: 'Error al cerrar sesión',
        message: 'Hubo un problema al cerrar la sesión, pero se cerró localmente.'
      });
    }
  }, [user, addNotification]);

  // ===== INITIALIZATION =====
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const auth = getAuthSession();
        
        if (auth && auth.user) {
          // Verificar si la sesión no ha expirado
          const expiry = new Date(auth.expiresAt);
          if (expiry > new Date()) {
            // Verificar token con el servidor (simulado)
            const result = await AuthService.verifyToken(auth.token);
            if (result.success) {
              setUser(auth.user);
            } else {
              clearAuthSession();
            }
          } else {
            clearAuthSession();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthSession();
        
        // Mostrar notificación de error de inicialización solo si es un error significativo
        if (error.message && !error.message.includes('token')) {
          addNotification({
            type: 'warning',
            title: 'Sesión expirada',
            message: 'Tu sesión anterior ha expirado. Por favor, inicia sesión nuevamente.'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [addNotification]);

  // Actualizar sesión cuando cambie el usuario
  useEffect(() => {
    if (user) {
      const auth = getAuthSession();
      if (auth) {
        saveAuthSession({
          ...auth,
          user: user // Actualizar datos del usuario
        });
      }
    }
  }, [user]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Cargando StriveForum...</p>
      </div>
    );
  }

  return (
    <>
      <AppRouter 
        user={user}
        setUser={setUser}
        notifications={notifications}
        setNotifications={setNotifications}
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        showRegisterModal={showRegisterModal}
        setShowRegisterModal={setShowRegisterModal}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleLogout={handleLogout}
      />
      
      {/* Modales de autenticación */}
      {showLoginModal && (
        <LoginModal
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onNotify={addNotification}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          show={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegister}
          onNotify={addNotification}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </>
  );
}

export default App;