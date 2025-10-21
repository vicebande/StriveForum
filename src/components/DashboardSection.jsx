import React, { useState } from 'react';

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

const DashboardSection = ({ user, onNavigate, onUpdateUser, existingUsernames, onNotify }) => {
  const [isEditing, setIsEditing] = useState(false);

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

  // demo stats
  const stats = [
    { icon: 'fa-gamepad', title: 'Partidas Jugadas', value: '122', delta: 8 },
    { icon: 'fa-comments', title: 'Posts Creados', value: '34', delta: -3 },
    { icon: 'fa-users', title: 'Seguidores', value: '48', delta: 12 },
    { icon: 'fa-star', title: 'Reputación', value: '1.4k', delta: 5 },
  ];

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
              <button className="action-card card-custom" onClick={() => onNavigate('forums')}>
                <div className="action-icon">
                  <i className="fas fa-comments" />
                </div>
                <div className="action-info">
                  <h4>Explorar Foros</h4>
                  <p>Participa en discusiones</p>
                </div>
                <i className="fas fa-arrow-right action-arrow" />
              </button>

              <button className="action-card card-custom" onClick={() => onNavigate('learning')}>
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
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-comment" />
                </div>
                <div className="activity-content">
                  <p>Participaste en el tema <strong>"Mejores combos para principiantes"</strong></p>
                  <span className="activity-time">Hace 2 horas</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-plus-circle" />
                </div>
                <div className="activity-content">
                  <p>Creaste un nuevo tema <strong>"Estrategias avanzadas"</strong></p>
                  <span className="activity-time">Hace 1 día</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-user-plus" />
                </div>
                <div className="activity-content">
                  <p>Te uniste a StriveForum</p>
                  <span className="activity-time">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Fecha desconocida'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardSection;