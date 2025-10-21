// Utilidades para manejo de roles y permisos
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Verificar si un usuario tiene un rol específico
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

// Verificar si un usuario es administrador
export const isAdmin = (user) => {
  return hasRole(user, USER_ROLES.ADMIN);
};

// Verificar si un usuario es usuario regular
export const isUser = (user) => {
  return hasRole(user, USER_ROLES.USER);
};

// Verificar si un usuario puede realizar una acción específica
export const canPerformAction = (user, action) => {
  if (!user) return false;
  
  // Si el usuario está bloqueado, no puede hacer nada excepto ver contenido
  if (user.username && isUserBlocked(user.username)) {
    const allowedForBlocked = ['VIEW_FORUMS', 'VIEW_TOPICS'];
    return allowedForBlocked.includes(action);
  }
  
  const permissions = {
    // Acciones que solo pueden hacer admins
    'VIEW_ADMIN_PANEL': isAdmin(user),
    'VIEW_REPORTS': isAdmin(user),
    'BLOCK_USERS': isAdmin(user),
    'UNBLOCK_USERS': isAdmin(user),
    'VIEW_USER_HISTORY': isAdmin(user),
    
    // Acciones que pueden hacer usuarios autenticados (no bloqueados)
    'REPORT_USERS': user && (isAdmin(user) || isUser(user)),
    'CREATE_TOPICS': user && (isAdmin(user) || isUser(user)),
    'CREATE_POSTS': user && (isAdmin(user) || isUser(user)),
    'REPLY_POSTS': user && (isAdmin(user) || isUser(user)),
    'VOTE_TOPICS': user && (isAdmin(user) || isUser(user)),
    
    // Acciones públicas
    'VIEW_FORUMS': true,
    'VIEW_TOPICS': true
  };
  
  return permissions[action] || false;
};

// Sistema de reportes
export const REPORT_REASONS = {
  SPAM: 'spam',
  HARASSMENT: 'harassment', 
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  OFFENSIVE_LANGUAGE: 'offensive_language',
  OTHER: 'other'
};

export const REPORT_REASONS_LABELS = {
  [REPORT_REASONS.SPAM]: 'Spam',
  [REPORT_REASONS.HARASSMENT]: 'Acoso',
  [REPORT_REASONS.INAPPROPRIATE_CONTENT]: 'Contenido inapropiado',
  [REPORT_REASONS.OFFENSIVE_LANGUAGE]: 'Lenguaje ofensivo',
  [REPORT_REASONS.OTHER]: 'Otro'
};

// Tiempo de cooldown para reportar al mismo usuario (20 minutos)
export const REPORT_COOLDOWN_MS = 20 * 60 * 1000; // 20 minutos

// Verificar si un usuario puede reportar a otro usuario específico
export const canReportUser = (reporterUsername, reportedUsername) => {
  if (reporterUsername === reportedUsername) return false; // No puedes reportarte a ti mismo
  
  const reports = JSON.parse(localStorage.getItem('sf_reports') || '[]');
  const lastReport = reports
    .filter(r => r.reporterUsername === reporterUsername && r.reportedUsername === reportedUsername)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
  if (!lastReport) return true;
  
  const timeSinceLastReport = Date.now() - new Date(lastReport.timestamp).getTime();
  return timeSinceLastReport >= REPORT_COOLDOWN_MS;
};

// Obtener tiempo restante para poder reportar a un usuario
export const getReportCooldownRemaining = (reporterUsername, reportedUsername) => {
  const reports = JSON.parse(localStorage.getItem('sf_reports') || '[]');
  const lastReport = reports
    .filter(r => r.reporterUsername === reporterUsername && r.reportedUsername === reportedUsername)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
  if (!lastReport) return 0;
  
  const timeSinceLastReport = Date.now() - new Date(lastReport.timestamp).getTime();
  const remaining = REPORT_COOLDOWN_MS - timeSinceLastReport;
  return Math.max(0, remaining);
};

// Formatear tiempo restante en minutos y segundos
export const formatCooldownTime = (milliseconds) => {
  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  return `${minutes}m ${seconds}s`;
};

// Crear un nuevo reporte
export const createReport = (reportData) => {
  const reports = JSON.parse(localStorage.getItem('sf_reports') || '[]');
  
  const newReport = {
    id: Date.now().toString(),
    reporterUsername: reportData.reporterUsername,
    reportedUsername: reportData.reportedUsername,
    reason: reportData.reason,
    description: reportData.description || '',
    postId: reportData.postId || null, // ID del post/mensaje reportado
    topicId: reportData.topicId || null, // ID del topic donde ocurrió
    contentType: reportData.contentType || 'post', // 'post', 'reply', 'topic'
    replyContent: reportData.replyContent || null, // Contenido de la respuesta reportada
    timestamp: new Date().toISOString(),
    status: 'pending', // pending, reviewed, dismissed
    reviewedBy: null,
    reviewedAt: null,
    action: null // action taken: warning, temporary_ban, permanent_ban, dismissed
  };
  
  reports.push(newReport);
  localStorage.setItem('sf_reports', JSON.stringify(reports));
  
  return newReport;
};

// Obtener reportes (para admin panel)
export const getReports = () => {
  return JSON.parse(localStorage.getItem('sf_reports') || '[]');
};

// Obtener reportes de un usuario específico
export const getUserReports = (username) => {
  const reports = getReports();
  return reports.filter(r => r.reportedUsername === username);
};

// Contar reportes por usuario
export const getReportCounts = () => {
  const reports = getReports();
  const counts = {};
  
  reports.forEach(report => {
    const username = report.reportedUsername;
    if (!counts[username]) {
      counts[username] = {
        total: 0,
        pending: 0,
        reviewed: 0
      };
    }
    counts[username].total++;
    counts[username][report.status]++;
  });
  
  return counts;
};

// Sistema de usuarios bloqueados
export const blockUser = (username, blockedBy, reason = '') => {
  if (!username) return false;
  
  const blockedUsers = JSON.parse(localStorage.getItem('sf_blocked_users') || '[]');
  
  // Verificar si ya está bloqueado
  if (blockedUsers.some(b => b.username === username)) {
    return false; // Ya está bloqueado
  }
  
  // Obtener información del usuario
  const allUsers = getAllUsers();
  const userInfo = allUsers.find(u => u.username === username);
  
  const blockRecord = {
    username,
    userId: userInfo?.id || `user_${username}`,
    email: userInfo?.email || '',
    blockedBy,
    reason,
    blockedAt: new Date().toISOString(),
    isBlocked: true,
    // Agregar estadísticas del usuario al momento del bloqueo
    userStats: {
      topicsCreated: getUserTopicCount(username),
      postsCreated: getUserPostCount(username),
      reportsReceived: getUserReports(username).length
    }
  };
  
  blockedUsers.push(blockRecord);
  localStorage.setItem('sf_blocked_users', JSON.stringify(blockedUsers));
  
  return true;
};

// Desbloquear usuario
export const unblockUser = (username) => {
  const blockedUsers = JSON.parse(localStorage.getItem('sf_blocked_users') || '[]');
  const filtered = blockedUsers.filter(b => b.username !== username);
  localStorage.setItem('sf_blocked_users', JSON.stringify(filtered));
  
  return true;
};

// Verificar si un usuario está bloqueado
export const isUserBlocked = (username) => {
  const blockedUsers = JSON.parse(localStorage.getItem('sf_blocked_users') || '[]');
  return blockedUsers.some(b => b.username === username && b.isBlocked);
};

// Obtener lista de usuarios bloqueados
export const getBlockedUsers = () => {
  return JSON.parse(localStorage.getItem('sf_blocked_users') || '[]');
};

// Obtener historial de actividad de un usuario
export const getUserActivityHistory = (username) => {
  const topics = JSON.parse(localStorage.getItem('sf_topics') || '[]');
  const postsMap = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
  const reports = getReports();
  
  const activity = [];
  
  // Agregar topics creados
  topics.filter(t => t.author === username).forEach(topic => {
    activity.push({
      type: 'topic_created',
      id: topic.id,
      title: topic.title,
      content: topic.content || 'Sin contenido',
      category: topic.category || 'General',
      timestamp: topic.createdAt,
      replies: topic.replies || 0,
      data: topic
    });
  });
  
  // Agregar posts/respuestas
  Object.entries(postsMap).forEach(([topicId, posts]) => {
    if (Array.isArray(posts)) {
      posts.filter(p => p.author === username).forEach(post => {
        const topic = topics.find(t => t.id === parseInt(topicId));
        activity.push({
          type: 'post_created', 
          id: post.id,
          title: topic?.title || 'Topic no encontrado',
          content: post.content || post.message || 'Sin contenido',
          timestamp: post.createdAt,
          topicId: parseInt(topicId),
          topicTitle: topic?.title,
          data: post
        });
        
        // Agregar respuestas del usuario a este post
        if (post.replies && Array.isArray(post.replies)) {
          post.replies.filter(r => r.author === username).forEach(reply => {
            activity.push({
              type: 'reply_created',
              id: reply.id,
              title: `Respuesta en: ${topic?.title || 'Topic no encontrado'}`,
              content: reply.content || 'Sin contenido',
              timestamp: reply.createdAt,
              topicId: parseInt(topicId),
              postId: post.id,
              topicTitle: topic?.title,
              data: reply
            });
          });
        }
      });
    }
  });
  
  // Agregar reportes recibidos
  reports.filter(r => r.reportedUsername === username).forEach(report => {
    const contentTypeText = report.contentType === 'reply' ? 'Respuesta reportada' : 'Usuario reportado';
    const displayContent = report.contentType === 'reply' && report.replyContent 
      ? report.replyContent 
      : report.description || 'Sin descripción';
    
    activity.push({
      type: 'reported',
      id: report.id,
      title: `${contentTypeText} por ${report.reporterUsername}`,
      content: displayContent,
      timestamp: report.timestamp,
      reason: report.reason,
      severity: report.severity || 'medium',
      contentType: report.contentType || 'post',
      data: report
    });
  });
  
  // Ordenar por fecha descendente
  return activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Obtener todos los reportes (alias para compatibilidad)
export const getAllReports = () => {
  return getReports();
};

// Obtener todos los usuarios registrados
export const getAllUsers = () => {
  const registeredUsers = JSON.parse(localStorage.getItem('sf_registered_users') || '[]');
  
  // Agregar usuario admin por defecto si no existe
  const adminExists = registeredUsers.some(u => u.username === 'admin');
  if (!adminExists) {
    registeredUsers.unshift({
      id: 'admin_user',
      username: 'admin',
      email: 'admin@striveforum.com',
      role: 'admin',
      registeredAt: '2024-01-01T00:00:00.000Z',
      isBlocked: false
    });
  }
  
  // Agregar estado de bloqueo a todos los usuarios
  return registeredUsers.map(user => ({
    ...user,
    isBlocked: isUserBlocked(user.username)
  }));
};

// Obtener número de topics creados por un usuario
export const getUserTopicCount = (username) => {
  const topics = JSON.parse(localStorage.getItem('sf_topics') || '[]');
  return topics.filter(t => t.author === username).length;
};

// Obtener número de posts creados por un usuario
export const getUserPostCount = (username) => {
  const postsMap = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
  let count = 0;
  
  Object.values(postsMap).forEach(posts => {
    if (Array.isArray(posts)) {
      count += posts.filter(p => p.author === username).length;
      // Contar también las respuestas
      posts.forEach(post => {
        if (post.replies && Array.isArray(post.replies)) {
          count += post.replies.filter(r => r.author === username).length;
        }
      });
    }
  });
  
  return count;
};

// Filtrar contenido visible (ocultar contenido de usuarios bloqueados excepto para admins)
export const filterVisibleContent = (content, currentUser = null) => {
  if (!content) return content;
  
  // Los admins pueden ver todo
  if (currentUser && isAdmin(currentUser)) {
    return content;
  }
  
  // Filtrar según el tipo de contenido
  if (Array.isArray(content)) {
    return content.filter(item => {
      if (item.author && isUserBlocked(item.author)) {
        return false; // Ocultar contenido de usuarios bloqueados
      }
      return true;
    });
  }
  
  // Para objetos individuales
  if (content.author && isUserBlocked(content.author)) {
    return null; // Ocultar si es de usuario bloqueado
  }
  
  return content;
};