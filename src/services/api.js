import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://127.0.0.1:3001/api';

// Configurar axios con timeout y interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se puede conectar al servidor. Asegúrate de que el backend esté ejecutándose.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Recurso no encontrado.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor.');
    }
    
    throw error;
  }
);

// ===== AUTENTICACIÓN =====

export const AuthAPI = {
  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return {
        success: true,
        user: response.data.user,
        token: `session_${Date.now()}` // Token simulado para mantener compatibilidad
      };
    } catch (error) {
      // Capturar mensaje de error del backend
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al iniciar sesión';
      
      // Traducir mensaje de cuenta bloqueada
      if (errorMsg.includes('blocked')) {
        throw new Error('Tu cuenta ha sido bloqueada. Contacta al administrador.');
      }
      
      throw new Error(errorMsg);
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return {
        success: true,
        user: response.data.user,
        token: `session_${Date.now()}`
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  },

  // Verificar "token" (simulado)
  verifyToken: async (token) => {
    // Como no usamos tokens reales, simplemente validamos si es válido
    if (token && token.includes('session_')) {
      return { success: true };
    }
    return { success: false };
  },

  // Logout (simulado)
  logout: async () => {
    return { success: true };
  }
};

// ===== USUARIOS =====

export const UsersAPI = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Obtener estadísticas de usuarios
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Crear usuario (usado internamente por el registro)
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Actualizar usuario
  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Eliminar usuario
  delete: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};

// ===== TEMAS =====

export const TopicsAPI = {
  // Obtener todos los temas con filtros
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const response = await api.get(`/topics?${params.toString()}`);
    return response.data;
  },

  // Obtener tema por ID
  getById: async (topicId) => {
    const response = await api.get(`/topics/${topicId}`);
    return response.data;
  },

  // Crear nuevo tema
  create: async (topicData) => {
    const response = await api.post('/topics', topicData);
    return response.data;
  },

  // Actualizar tema
  update: async (topicId, topicData) => {
    const response = await api.put(`/topics/${topicId}`, topicData);
    return response.data;
  },

  // Eliminar tema
  delete: async (topicId) => {
    const response = await api.delete(`/topics/${topicId}`);
    return response.data;
  },

  // Votar tema
  vote: async (topicId, voteData) => {
    console.log('🔄 TopicsAPI.vote called with:', { topicId, voteData });
    console.log('🔄 Request URL:', `/topics/${topicId}/vote`);
    console.log('🔄 Request data:', JSON.stringify(voteData));
    
    const response = await api.post(`/topics/${topicId}/vote`, voteData);
    console.log('🔄 Response received:', response.data);
    return response.data;
  },

  // Incrementar vistas
  incrementViews: async (topicId) => {
    const response = await api.put(`/topics/${topicId}/view`);
    return response.data;
  }
};

// ===== POSTS =====

export const PostsAPI = {
  // Obtener todos los posts (con filtros opcionales)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.topic_id) params.append('topic_id', filters.topic_id);
    if (filters.author_id) params.append('author_id', filters.author_id);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  },

  // Obtener posts de un tema
  getByTopic: async (topicId) => {
    const response = await api.get(`/posts?topic_id=${topicId}`);
    return response.data;
  },

  // Obtener post por ID
  getById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // Crear nuevo post
  create: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Actualizar post
  update: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  // Eliminar post
  delete: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Votar post (like/dislike)
  vote: async (postId, voteData) => {
    console.log('🔄 PostsAPI.vote called with:', { postId, voteData });
    console.log('🔄 Request URL:', `/posts/${postId}/vote`);
    console.log('🔄 Request data:', JSON.stringify(voteData));
    
    const response = await api.post(`/posts/${postId}/vote`, voteData);
    console.log('🔄 Response received:', response.data);
    return response.data;
  },

  // Obtener posts con respuestas anidadas
  getAllWithReplies: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.topic_id) params.append('topic_id', filters.topic_id);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/posts/with-replies?${params.toString()}`);
    return response.data;
  },

  // Obtener respuestas de un post específico
  getReplies: async (postId) => {
    const response = await api.get(`/posts/${postId}/replies`);
    return response.data;
  },

  // Crear respuesta a un post
  createReply: async (postId, replyData) => {
    const response = await api.post(`/posts/${postId}/reply`, replyData);
    return response.data;
  }
};

// ===== REPORTES =====

export const ReportsAPI = {
  // Obtener todos los reportes (admin)
  getAll: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  // Crear nuevo reporte
  create: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  // Revisar reporte (admin)
  review: async (reportId, reviewData) => {
    const response = await api.put(`/reports/${reportId}/review`, reviewData);
    return response.data;
  },

  // Obtener estadísticas de reportes
  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  }
};

// ===== FUNCIONES DE UTILIDAD =====

// Verificar si el servidor está disponible
export const healthCheck = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return response.data;
  } catch (error) {
    throw new Error('El servidor no está disponible');
  }
};

// Obtener datos para el dashboard
export const getDashboardData = async () => {
  try {
    const [usersStats, recentTopics, recentPosts] = await Promise.all([
      UsersAPI.getStats(),
      TopicsAPI.getAll({ sortBy: 'new', limit: 10 }),
      PostsAPI.getAll({ limit: 10, sortBy: 'new' })
    ]);

    return {
      usersStats: {
        totalUsers: usersStats.totalUsers || 0,
        totalTopics: usersStats.totalTopics || 0, 
        totalPosts: usersStats.totalPosts || 0,
        totalReports: usersStats.totalReports || 0,
        onlineUsers: usersStats.onlineUsers || Math.floor(Math.random() * 10) + 1 // Simular usuarios online
      },
      recentTopics: recentTopics || [],
      recentPosts: recentPosts || [],
      recentActivity: recentTopics || []
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return fallback data instead of throwing
    return {
      usersStats: {
        totalUsers: 0,
        totalTopics: 0,
        totalPosts: 0,
        totalReports: 0,
        onlineUsers: 0
      },
      recentTopics: [],
      recentPosts: [],
      recentActivity: []
    };
  }
};

// Funciones para mantener compatibilidad con el código existente
export const fetchRecentTopics = async () => {
  const data = await TopicsAPI.getAll({ sortBy: 'new', limit: 10 });
  return data.topics || [];
};

export const fetchOnlineUsers = async () => {
  // Como no tenemos sistema de "online" real, devolvemos usuarios recientes
  const stats = await UsersAPI.getStats();
  return {
    count: stats.totalUsers || 0,
    users: [] // Lista vacía por ahora
  };
};

export const fetchTopPlayers = async () => {
  // Devolvemos usuarios con más actividad (simulado)
  const users = await UsersAPI.getAll();
  return users.slice(0, 5); // Top 5 usuarios
};

// Exportaciones adicionales
export default api;
export { API_BASE_URL };

// Función para testing - verificar conexión con el backend
export const testConnection = async () => {
  try {
    const health = await healthCheck();
    console.log('✅ Backend connection successful:', health);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return false;
  }
};

// Exponer funciones globalmente para debugging
if (typeof window !== 'undefined') {
  window.testConnection = testConnection;
  window.API = {
    AuthAPI,
    UsersAPI,
    TopicsAPI,
    PostsAPI,
    ReportsAPI,
    healthCheck,
    getDashboardData
  };
}