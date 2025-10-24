// Utilidades para manejar localStorage de manera robusta
export const TOPICS_KEY = 'sf_topics';
export const POSTS_KEY = 'sf_postsMap'; // Cambiado para coincidir con el código existente
export const USERS_KEY = 'sf_registered_users';
export const AUTH_SESSION_KEY = 'sf_auth_session';
export const CURRENT_SECTION_KEY = 'sf_current_section';

// Función segura para parsear JSON
export const safeParse = (data, fallback = null) => {
  try {
    if (!data || data === 'undefined' || data === 'null') {
      console.log('🔍 SafeParse: No data or invalid data, returning fallback:', fallback);
      return fallback;
    }
    const parsed = JSON.parse(data);
    console.log('✅ SafeParse successful:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ SafeParse error:', error);
    return fallback;
  }
};

// Función segura para guardar en localStorage
export const safeStorageSet = (key, value) => {
  try {
    console.log(`💾 Saving to localStorage [${key}]:`, value);
    const stringified = JSON.stringify(value);
    localStorage.setItem(key, stringified);
    
    // Verificar que se guardó correctamente
    const verified = localStorage.getItem(key);
    console.log(`✅ Verification - saved data:`, verified);
    return true;
  } catch (error) {
    console.error(`❌ Error saving to localStorage [${key}]:`, error);
    return false;
  }
};

// Función segura para leer de localStorage
export const safeStorageGet = (key, fallback = null) => {
  try {
    console.log(`📖 Reading from localStorage [${key}]`);
    const data = localStorage.getItem(key);
    console.log(`📄 Raw data from localStorage:`, data);
    return safeParse(data, fallback);
  } catch (error) {
    console.error(`❌ Error reading from localStorage [${key}]:`, error);
    return fallback;
  }
};

// Función para limpiar localStorage (para debugging)
export const clearAllData = () => {
  console.log('🧹 Clearing all forum data from localStorage');
  localStorage.removeItem(TOPICS_KEY);
  localStorage.removeItem(POSTS_KEY);
};

// Función para limpiar TODOS los datos de la app (incluyendo usuarios y auth)
export const clearAllAppData = () => {
  console.log('🧹 Clearing ALL app data from localStorage');
  localStorage.removeItem(TOPICS_KEY);
  localStorage.removeItem(POSTS_KEY);
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(CURRENT_SECTION_KEY);
};

// ===== FUNCIONES PARA USUARIOS =====

// Obtener lista de usuarios registrados
export const getRegisteredUsers = () => {
  return safeStorageGet(USERS_KEY, []);
};

// Guardar lista de usuarios registrados
export const saveRegisteredUsers = (users) => {
  return safeStorageSet(USERS_KEY, users);
};

// Registrar un nuevo usuario
export const registerUser = (userData) => {
  try {
    const existingUsers = getRegisteredUsers();
    
    // Verificar si el usuario ya existe
    const userExists = existingUsers.some(u => 
      u.username.toLowerCase() === userData.username.toLowerCase()
    );
    
    if (userExists) {
      return { success: false, error: 'Usuario ya existe' };
    }
    
    // Agregar nuevo usuario
    const newUser = {
      ...userData,
      id: Date.now().toString(), // ID único
      createdAt: Date.now()
    };
    
    existingUsers.push(newUser);
    const saved = saveRegisteredUsers(existingUsers);
    
    return saved ? 
      { success: true, user: newUser } : 
      { success: false, error: 'Error guardando usuario' };
      
  } catch (error) {
    console.error('❌ Error registering user:', error);
    return { success: false, error: 'Error en el registro' };
  }
};

// Verificar credenciales de login
export const verifyUserCredentials = (username, password) => {
  try {
    const users = getRegisteredUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password
    );
    
    return user ? { success: true, user } : { success: false, error: 'Credenciales inválidas' };
  } catch (error) {
    console.error('❌ Error verifying credentials:', error);
    return { success: false, error: 'Error verificando credenciales' };
  }
};

// ===== FUNCIONES PARA AUTENTICACIÓN =====

// Obtener sesión de autenticación actual
export const getAuthSession = () => {
  try {
    const session = safeStorageGet(AUTH_SESSION_KEY, null);
    if (!session) return null;
    
    // Verificar si la sesión no ha expirado
    const expiry = new Date(session.expiresAt);
    if (expiry > new Date()) {
      return session;
    } else {
      // Sesión expirada, limpiarla
      clearAuthSession();
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting auth session:', error);
    return null;
  }
};

// Guardar sesión de autenticación
export const saveAuthSession = (authData) => {
  return safeStorageSet(AUTH_SESSION_KEY, authData);
};

// Limpiar sesión de autenticación
export const clearAuthSession = () => {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
    console.log('🔓 Auth session cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth session:', error);
    return false;
  }
};

// ===== FUNCIONES PARA NAVEGACIÓN =====

// Obtener sección actual
export const getCurrentSection = () => {
  return safeStorageGet(CURRENT_SECTION_KEY, 'home');
};

// Guardar sección actual
export const saveCurrentSection = (section) => {
  return safeStorageSet(CURRENT_SECTION_KEY, section);
};

// Función para mostrar todo el contenido de localStorage
export const debugStorage = () => {
  console.log('🔍 localStorage Debug Info:');
  console.log('Topics:', safeStorageGet(TOPICS_KEY, []));
  console.log('Posts:', safeStorageGet(POSTS_KEY, {}));
  console.log('Users:', safeStorageGet(USERS_KEY, []));
  console.log('Auth Session:', safeStorageGet(AUTH_SESSION_KEY, null));
  console.log('Current Section:', safeStorageGet(CURRENT_SECTION_KEY, 'home'));
  console.log('Raw localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value);
  }
};

// Exponer funciones globalmente para debugging en el navegador
if (typeof window !== 'undefined') {
  window.debugStorage = debugStorage;
  window.clearAllData = clearAllData;
  window.clearAllAppData = clearAllAppData;
}