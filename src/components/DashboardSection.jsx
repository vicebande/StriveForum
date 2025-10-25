import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, title, value, delta }) => (
  <div className="dashboard-stat-card card-custom">
    <div className="stat-content">
      <div className="stat-icon-wrapper">
        <i className={`fas ${icon}`} />
      </div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {delta !== undefined && (
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

  // Obtener datos del localStorage
  const topics = JSON.parse(localStorage.getItem('sf_topics') || '[]');
  const postsMap = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
  
  // Calcular temas creados por el usuario
  const topicsCreated = topics.filter(topic => topic.author === username).length;
  
  // Calcular respuestas creadas por el usuario (posts en temas de otros)
  let repliesCreated = 0;
  Object.values(postsMap).forEach(posts => {
    if (Array.isArray(posts)) {
      repliesCreated += posts.filter(post => post.author === username).length;
    }
  });

  // Calcular topics únicos en los que ha participado (diversidad de participación)
  const participatedTopics = new Set();
  Object.keys(postsMap).forEach(topicId => {
    const posts = postsMap[topicId];
    if (Array.isArray(posts)) {
      const hasUserPosts = posts.some(post => post.author === username);
      if (hasUserPosts) {
        participatedTopics.add(topicId);
      }
    }
  });
  
  // Calcular reputación basada en votos recibidos
  let reputation = 0;
  Object.values(postsMap).forEach(posts => {
    if (Array.isArray(posts)) {
      posts.forEach(post => {
        if (post.author === username) {
          reputation += (post.likes || 0) - (post.dislikes || 0);
        }
      });
    }
  });
  
  // Calcular votos en topics del usuario
  topics.forEach(topic => {
    if (topic.author === username) {
      reputation += (topic.likes || 0) - (topic.dislikes || 0);
    }
  });
  

  
  return {
    topicsCreated,
    repliesCreated,
    reputation, // Permitir reputación negativa (es realista)
    participatedTopics: participatedTopics.size
  };
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
const getRecentActivity = (username) => {
  if (!username) return [];

  const topics = JSON.parse(localStorage.getItem('sf_topics') || '[]');
  const postsMap = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
  
  const activities = [];
  
  // Obtener temas creados por el usuario
  const userTopics = topics
    .filter(topic => topic.author === username)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3); // Últimos 3 temas
  
  userTopics.forEach(topic => {
    activities.push({
      type: 'topic_created',
      title: topic.title,
      time: topic.createdAt,
      icon: 'fa-plus-circle'
    });
  });
  
  // Obtener posts/respuestas del usuario
  Object.entries(postsMap).forEach(([topicId, posts]) => {
    if (Array.isArray(posts)) {
      const userPosts = posts
        .filter(post => post.author === username)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2); // Últimos 2 posts por tema
      
      userPosts.forEach(post => {
        const topic = topics.find(t => t.id === parseInt(topicId));
        if (topic) {
          activities.push({
            type: 'post_created',
            title: topic.title,
            time: post.createdAt,
            icon: 'fa-comment'
          });
        }
      });
    }
  });
  
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
  const [previousStats, setPreviousStats] = useState(null);

  const handleProfileSave = (updatedData) => {
    if (onUpdateUser) {
      onUpdateUser(updatedData);
      setIsEditing(false);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Perfil actualizado',
          message: 'Tu información se ha guardado correctamente'
        });
      }
    }
  };

  // Calcular estadísticas reales del usuario
  const currentStats = useMemo(() => {
    return calculateUserStats(user.username);
  }, [user.username]);

  // Cargar estadísticas anteriores del localStorage y guardar las actuales
  // Cargar estadísticas previas solo al montar
  useEffect(() => {
    const statsKey = `sf_user_stats_${user.username}`;
    const savedStats = JSON.parse(localStorage.getItem(statsKey) || 'null');
    // Defer setState to avoid calling synchronously in effect
    Promise.resolve().then(() => {
      if (savedStats) {
        setPreviousStats(savedStats);
      } else {
        // Si no hay estadísticas anteriores, usar las actuales como base
        setPreviousStats(currentStats);
      }
    });
  }, [user.username, currentStats]);

  // Guardar estadísticas cuando cambien
  useEffect(() => {
    const statsKey = `sf_user_stats_${user.username}`;
    localStorage.setItem(statsKey, JSON.stringify(currentStats));
  }, [currentStats, user.username]);

  // Crear array de estadísticas con deltas calculados
  const stats = useMemo(() => {
    if (!previousStats) return [];

    return [
      { 
        icon: 'fa-plus-circle', 
        title: 'Temas Creados', 
        value: currentStats.topicsCreated.toString(), 
        delta: calculateDelta(currentStats.topicsCreated, previousStats.topicsCreated)
      },
      { 
        icon: 'fa-reply', 
        title: 'Respuestas Dadas', 
        value: currentStats.repliesCreated.toString(), 
        delta: calculateDelta(currentStats.repliesCreated, previousStats.repliesCreated)
      },
      { 
        icon: 'fa-comments', 
        title: 'Temas Participados', 
        value: currentStats.participatedTopics.toString(), 
        delta: calculateDelta(currentStats.participatedTopics, previousStats.participatedTopics)
      },
      { 
        icon: 'fa-star', 
        title: 'Reputación', 
        value: currentStats.reputation >= 0 ? `+${currentStats.reputation}` : currentStats.reputation.toString(), 
        delta: calculateDelta(currentStats.reputation, previousStats.reputation)
      },
    ];
  }, [currentStats, previousStats]);

  // Obtener actividad reciente del usuario
  const recentActivity = useMemo(() => {
    return getRecentActivity(user.username);
  }, [user.username]);

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