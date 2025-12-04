import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardData, UsersAPI } from '../services/api';

const StatCard = ({ icon, title, value, delta, loading = false }) => (
  <div className="dashboard-stat-card card-custom">
    <div className="stat-content">
      <div className="stat-icon-wrapper">
        <i className={`fas ${icon}`} />
      </div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">
          {loading ? (
            <div className="loading-placeholder">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          ) : (
            value || '0'
          )}
        </div>
        {!loading && delta !== undefined && (
          <div className={`stat-delta ${delta >= 0 ? 'positive' : 'negative'}`}>
            <i className={`fas fa-arrow-${delta >= 0 ? 'up' : 'down'}`} />
            {Math.abs(delta)}%
          </div>
        )}
      </div>
    </div>
  </div>
);

const ProfileEditForm = ({ user, onSave, onCancel, existingUsernames }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username !== user.username && existingUsernames?.includes(formData.username)) {
      newErrors.username = 'Este nombre de usuario ya existe';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Ingresa tu nombre de usuario"
          />
          {errors.username && <div className="invalid-feedback">{errors.username}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Ingresa tu email"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          <i className="fas fa-times me-2" />Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-save me-2" />Guardar
        </button>
      </div>
    </form>
  );
};

// Función para calcular estadísticas reales del usuario
const calculateUserStats = (username) => {
  if (!username) return { topicsCreated: 0, repliesCreated: 0, reputation: 0, participatedTopics: 0 };

  try {
    // Obtener datos del localStorage con manejo de errores
    const topics = JSON.parse(localStorage.getItem('sf_topics') || '[]');
    const postsMap = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
    
    // Validar que los datos son arrays/objetos válidos
    if (!Array.isArray(topics) || typeof postsMap !== 'object') {
      return { topicsCreated: 0, repliesCreated: 0, reputation: 0, participatedTopics: 0 };
    }
    
    // Calcular temas creados por el usuario
    const topicsCreated = topics.filter(topic => 
      topic && (topic.author === username || topic.author_username === username)
    ).length;
    
    // Calcular respuestas creadas por el usuario (posts en temas de otros)
    let repliesCreated = 0;
    Object.values(postsMap).forEach(posts => {
      if (Array.isArray(posts)) {
        repliesCreated += posts.filter(post => 
          post && (post.author === username || post.author_username === username)
        ).length;
      }
    });

    // Calcular topics únicos en los que ha participado (diversidad de participación)
    const participatedTopics = new Set();
    Object.keys(postsMap).forEach(topicId => {
      const posts = postsMap[topicId];
      if (Array.isArray(posts)) {
        const hasUserPosts = posts.some(post => 
          post && (post.author === username || post.author_username === username)
        );
        if (hasUserPosts) {
          participatedTopics.add(topicId);
        }
      }
    });
    
    // Calcular reputación basada en votos recibidos
    let reputation = 0;
    
    // Reputación de topics
    topics.forEach(topic => {
      if (topic && (topic.author === username || topic.author_username === username)) {
        reputation += (topic.upvotes || 0) - (topic.downvotes || 0);
      }
    });
    
    // Reputación de posts/respuestas
    Object.values(postsMap).forEach(posts => {
      if (Array.isArray(posts)) {
        posts.forEach(post => {
          if (post && (post.author === username || post.author_username === username)) {
            reputation += (post.likes || 0) - (post.dislikes || 0);
          }
        });
      }
    });

    return {
      topicsCreated,
      repliesCreated,
      reputation,
      participatedTopics: participatedTopics.size
    };
    
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return { topicsCreated: 0, repliesCreated: 0, reputation: 0, participatedTopics: 0 };
  }
};

// Función para formatear números grandes (actualmente no se usa pero puede ser útil)
// const formatNumber = (num) => {
//   if (num >= 1000000) {
//     const formatted = (num / 1000000).toFixed(1);
//     return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'M' : formatted + 'M';
//   }
//   if (num >= 1000) {
//     const formatted = (num / 1000).toFixed(1);
//     return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'k' : formatted + 'k';
//   }
//   return num.toString();
// };

// Función para calcular el delta (cambio porcentual)
const calculateDelta = (current, previous) => {
  if (previous === 0) {
    if (current > 0) return 100;
    if (current < 0) return -100;
    return 0;
  }
  const delta = Math.round(((current - previous) / Math.abs(previous)) * 100);
  return Math.min(Math.max(delta, -999), 999); // Limitar entre -999% y 999%
};

// Función para obtener actividad reciente del usuario
const getRecentActivityFromAPI = (dashboardData, username) => {
  if (!dashboardData || !username) return [];

  const activities = [];
  
  // Obtener temas creados por el usuario desde la API
  const userTopics = (dashboardData.recentTopics || [])
    .filter(topic => topic.author_username === username)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3); // Últimos 3 temas
  
  userTopics.forEach(topic => {
    activities.push({
      type: 'topic_created',
      title: topic.title,
      time: topic.created_at,
      icon: 'fa-plus-circle'
    });
  });
  
  // También podríamos agregar posts del usuario si están disponibles en dashboardData
  if (dashboardData.recentPosts) {
    const userPosts = dashboardData.recentPosts
      .filter(post => post.author_username === username)
      .slice(0, 2); // Últimos 2 posts
    
    userPosts.forEach(post => {
      activities.push({
        type: 'post_created', 
        title: post.topic_title || 'Respuesta en tema',
        time: post.created_at,
        icon: 'fa-comment'
      });
    });
  }
  
  // Ordenar por fecha y tomar los más recientes
  return activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5); // Máximo 5 actividades
};

// Función para formatear tiempo relativo
const getRelativeTime = (dateString) => {
  if (!dateString) return 'Fecha desconocida';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short'
  });
};

const DashboardSection = ({ user, onNavigate, onUpdateUser, existingUsernames, onNotify }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [previousStats, setPreviousStats] = useState({
    topicsCreated: 0,
    repliesCreated: 0,
    reputation: 0,
    participatedTopics: 0
  });
  const [currentStats, setCurrentStats] = useState({
    topicsCreated: 0,
    repliesCreated: 0,
    reputation: 0,
    participatedTopics: 0
  });
  const [dashboardData, setDashboardData] = useState({
    recentTopics: [],
    totalUsers: 0,
    totalTopics: 0,
    totalPosts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del dashboard desde la API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getDashboardData();
        setDashboardData(data);
        
        // Calcular estadísticas reales del usuario basadas en los datos de la API
        const allTopics = data.recentTopics || [];
        const userTopics = allTopics.filter(topic => topic.author_username === user.username);
        
        // Obtener posts del usuario desde la API
        const getUserPosts = async () => {
          try {
            const postsData = await PostsAPI.getAll({ author_username: user.username });
            return postsData || [];
          } catch (err) {
            console.warn('Could not fetch user posts:', err);
            return [];
          }
        };
        
        const userPosts = await getUserPosts();
        
        const userStats = {
          topicsCreated: userTopics.length,
          repliesCreated: userPosts.length,
          reputation: userTopics.reduce((sum, topic) => sum + ((topic.upvotes || 0) - (topic.downvotes || 0)), 0) +
                     userPosts.reduce((sum, post) => sum + ((post.likes || 0) - (post.dislikes || 0)), 0),
          participatedTopics: new Set([...userTopics.map(t => t.id), ...userPosts.map(p => p.topic_id)]).size
        };
        setCurrentStats(userStats);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message);
        
        if (onNotify) {
          onNotify({
            type: 'warning',
            title: 'Datos limitados',
            message: 'No se pudieron cargar algunos datos del servidor'
          });
        }
        
        // Usar datos de fallback
        setCurrentStats(calculateUserStats(user.username));
        
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user.username, onNotify]);

  const handleProfileSave = async (updatedData) => {
    try {
      // Actualizar en la API
      const updatedUser = await UsersAPI.update(user.id, {
        username: updatedData.username,
        email: updatedData.email,
        role: user.role,
        is_blocked: user.is_blocked || 0
      });

      // Si tiene éxito, actualizar en el componente padre
      if (onUpdateUser) {
        onUpdateUser(updatedData);
      }

      setIsEditing(false);
      
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Perfil actualizado',
          message: 'Tu información se ha guardado correctamente en el servidor'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Intentar guardar localmente como fallback
      if (onUpdateUser) {
        onUpdateUser(updatedData);
        setIsEditing(false);
        
        if (onNotify) {
          onNotify({
            type: 'warning',
            title: 'Guardado localmente',
            message: 'Tu perfil se guardó localmente, pero no se pudo sincronizar con el servidor'
          });
        }
      } else {
        if (onNotify) {
          onNotify({
            type: 'error',
            title: 'Error',
            message: 'No se pudo actualizar el perfil: ' + (error.message || 'Error desconocido')
          });
        }
      }
    }
  };

  // Cargar estadísticas anteriores del localStorage solo al montar
  useEffect(() => {
    const statsKey = `sf_user_stats_${user.username}`;
    const savedStats = JSON.parse(localStorage.getItem(statsKey) || 'null');
    
    if (savedStats) {
      setPreviousStats(savedStats);
    } else {
      // Si no hay estadísticas anteriores, inicializar con zeros
      const initialStats = {
        topicsCreated: 0,
        repliesCreated: 0,
        reputation: 0,
        participatedTopics: 0
      };
      setPreviousStats(initialStats);
    }
  }, [user.username]); // Solo depender del username

  // Guardar estadísticas cuando cambien
  useEffect(() => {
    const statsKey = `sf_user_stats_${user.username}`;
    localStorage.setItem(statsKey, JSON.stringify(currentStats));
  }, [currentStats, user.username]);

  // Crear array de estadísticas con deltas calculados
  const stats = useMemo(() => {
    if (!previousStats || !currentStats) {
      // Return loading stats while data is being loaded
      return [
        { icon: 'fa-plus-circle', title: 'Temas Creados', value: '0', loading: true },
        { icon: 'fa-reply', title: 'Respuestas Dadas', value: '0', loading: true },
        { icon: 'fa-comments', title: 'Temas Participados', value: '0', loading: true },
        { icon: 'fa-star', title: 'Reputación', value: '0', loading: true }
      ];
    }

    return [
      { 
        icon: 'fa-plus-circle', 
        title: 'Temas Creados', 
        value: (currentStats.topicsCreated || 0).toString(), 
        delta: calculateDelta(currentStats.topicsCreated || 0, previousStats.topicsCreated || 0),
        loading: false
      },
      { 
        icon: 'fa-reply', 
        title: 'Respuestas Dadas', 
        value: (currentStats.repliesCreated || 0).toString(), 
        delta: calculateDelta(currentStats.repliesCreated || 0, previousStats.repliesCreated || 0),
        loading: false
      },
      { 
        icon: 'fa-comments', 
        title: 'Temas Participados', 
        value: (currentStats.participatedTopics || 0).toString(), 
        delta: calculateDelta(currentStats.participatedTopics || 0, previousStats.participatedTopics || 0),
        loading: false
      },
      { 
        icon: 'fa-star', 
        title: 'Reputación', 
        value: (currentStats.reputation || 0) >= 0 ? `+${currentStats.reputation || 0}` : (currentStats.reputation || 0).toString(), 
        delta: calculateDelta(currentStats.reputation || 0, previousStats.reputation || 0),
        loading: false
      },
    ];
  }, [currentStats, previousStats]);

  // Obtener actividad reciente del usuario
  const recentActivity = useMemo(() => {
    return getRecentActivityFromAPI(dashboardData, user.username);
  }, [dashboardData, user.username]);

  // Escuchar cambios en localStorage para actualizar estadísticas en tiempo real
  useEffect(() => {
    const handleStorageChange = () => {
      // Forzar re-renderizado cuando cambian los datos
      const newStats = calculateUserStats(user.username);
      const statsKey = `sf_user_stats_${user.username}`;
      
      // Actualizar estadísticas anteriores con las actuales antes del cambio
      const currentSaved = JSON.parse(localStorage.getItem(statsKey) || 'null');
      if (currentSaved && JSON.stringify(currentSaved) !== JSON.stringify(newStats)) {
        setPreviousStats(currentSaved);
        localStorage.setItem(statsKey, JSON.stringify(newStats));
      }
    };

    // Escuchar cambios específicos en las claves que nos interesan
    const checkForChanges = () => {
      handleStorageChange();
    };

    // Verificar cambios cada 2 segundos (cuando el usuario está activo)
    const interval = setInterval(checkForChanges, 2000);

    return () => clearInterval(interval);
  }, [user.username]);

  // Loading state
  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              <i className="fas fa-tachometer-alt me-3" />
              Dashboard
            </h1>
            <p className="dashboard-subtitle">Bienvenido de vuelta, {user.username}</p>
          </div>
          <div className="text-center py-5">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
            </div>
            <p className="mt-3 text-muted">Cargando datos del dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="dashboard-section">
        <div className="container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              <i className="fas fa-tachometer-alt me-3" />
              Dashboard
            </h1>
            <p className="dashboard-subtitle">Bienvenido de vuelta, {user.username}</p>
          </div>
          <div className="text-center py-5">
            <div className="error-state">
              <i className="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
              <h4>Error al cargar datos</h4>
              <p className="text-muted mb-3">{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-refresh me-2"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <i className="fas fa-tachometer-alt me-3" />
            Dashboard
          </h1>
          <p className="dashboard-subtitle">Bienvenido de vuelta, {user.username}</p>
          {error && (
            <div className="alert alert-warning mt-2" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Algunos datos no están disponibles. Verifica que el servidor esté funcionando.
            </div>
          )}
        </div>

        <div className="dashboard-content">
          {/* Profile Card */}
          <div className="dashboard-profile-card card-custom">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="profile-info">
                {!isEditing ? (
                  <>
                    <h3 className="profile-name">{user.username}</h3>
                    <p className="profile-email">{user.email}</p>
                    <p className="profile-date">
                      <i className="fas fa-calendar-alt me-2" />
                      Miembro desde {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Desconocido'}
                    </p>
                  </>
                ) : (
                  <ProfileEditForm
                    user={user}
                    onSave={handleProfileSave}
                    onCancel={() => setIsEditing(false)}
                    existingUsernames={existingUsernames}
                  />
                )}
              </div>
            </div>
            
            {!isEditing && (
              <div className="profile-actions">
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  <i className="fas fa-edit me-2" />Editar Perfil
                </button>
                <button className="btn btn-secondary" onClick={() => onNavigate('forums')}>
                  <i className="fas fa-comments me-2" />Ir a Foros
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="dashboard-stats">
            <h3 className="section-title">
              <i className="fas fa-chart-line me-2" />
              Estadísticas
            </h3>
            <div className="stats-grid">
              {stats.map(stat => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-actions">
            <h3 className="section-title">
              <i className="fas fa-bolt me-2" />
              Accesos Rápidos
            </h3>
            <div className="actions-grid">
              <button className="action-card card-custom" onClick={() => navigate('/forums')}>
                <div className="action-icon">
                  <i className="fas fa-comments" />
                </div>
                <div className="action-info">
                  <h4>Explorar Foros</h4>
                  <p>Participa en discusiones</p>
                </div>
                <i className="fas fa-arrow-right action-arrow" />
              </button>

              <button className="action-card card-custom" onClick={() => navigate('/learning')}>
                <div className="action-icon">
                  <i className="fas fa-graduation-cap" />
                </div>
                <div className="action-info">
                  <h4>Recursos de Aprendizaje</h4>
                  <p>Mejora tus habilidades</p>
                </div>
                <i className="fas fa-arrow-right action-arrow" />
              </button>

              <div className="action-card card-custom disabled">
                <div className="action-icon">
                  <i className="fas fa-trophy" />
                </div>
                <div className="action-info">
                  <h4>Torneos</h4>
                  <p>Próximamente</p>
                </div>
                <i className="fas fa-clock action-arrow" />
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="dashboard-activity">
            <h3 className="section-title">
              <i className="fas fa-history me-2" />
              Actividad Reciente
            </h3>
            <div className="activity-card card-custom">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className={`fas ${activity.icon}`} />
                    </div>
                    <div className="activity-content">
                      <p>
                        {activity.type === 'topic_created' 
                          ? `Creaste el tema ` 
                          : `Participaste en el tema `}
                        <strong>"{activity.title}"</strong>
                      </p>
                      <span className="activity-time">{getRelativeTime(activity.time)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-info-circle" />
                    </div>
                    <div className="activity-content">
                      <p>¡Bienvenido a StriveForum! Comienza creando tu primer tema o participando en discusiones.</p>
                      <span className="activity-time">Ahora mismo</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-user-plus" />
                    </div>
                    <div className="activity-content">
                      <p>Te uniste a StriveForum</p>
                      <span className="activity-time">{user.createdAt ? getRelativeTime(user.createdAt) : 'Fecha desconocida'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;