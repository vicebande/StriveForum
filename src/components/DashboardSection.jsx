import React, { useState } from 'react';
import ProfileEditModal from './modals/ProfileEditModal';

const StatCard = ({ icon, title, value, delta }) => (
  <div className="stat-card card-custom">
    <div className="stat-left">
      <i className={`fas ${icon} stat-icon`} />
    </div>
    <div className="stat-right">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {delta !== undefined && <div className={`stat-delta ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? `+${delta}%` : `${delta}%`}</div>}
    </div>
  </div>
);

const DashboardSection = ({ user, onNavigate, onUpdateUser, existingUsernames, onNotify }) => {
  const [showEdit, setShowEdit] = useState(false);

  // demo stats
  const stats = [
    { icon: 'fa-gamepad', title: 'Partidas', value: '122', delta: 8 },
    { icon: 'fa-comments', title: 'Temas', value: '34', delta: -3 },
    { icon: 'fa-users', title: 'Miembros seguidos', value: '48', delta: 12 },
    { icon: 'fa-star', title: 'Reputación', value: '1.4k', delta: 5 },
  ];

  return (
    <section className="container" style={{ paddingTop: 90 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Perfil */}
        <div style={{ minWidth: 280, width: 320 }}>
          <div className="card-custom profile-card p-3">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="avatar" aria-hidden>
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{user.username}</h3>
                <div className="small text-muted" style={{ color: 'var(--muted)' }}>{user.email}</div>
                <div className="small" style={{ marginTop: 8, color: 'var(--muted)' }}>
                  Miembro desde: {user.createdAt ? (new Date(user.createdAt)).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={() => setShowEdit(true)}><i className="fas fa-edit me-2" />Editar perfil</button>
              <button className="btn btn-secondary" onClick={() => onNavigate('forums')}><i className="fas fa-comments me-2" />Ir a Foros</button>
            </div>
          </div>

          {/* información adicional */}
          <div style={{ marginTop: 12 }}>
            <div className="card-custom p-3">
              <h5 style={{ marginTop: 0 }}>Resumen rápido</h5>
              <div style={{ color: 'var(--muted)' }}>
                Última actividad: Hace 2 días<br />
                Mensajes sin leer: 3
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 4 }}>Panel de control</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 12 }}>
            {stats.map(s => <StatCard key={s.title} {...s} />)}
          </div>

          <div style={{ marginTop: 20 }}>
            <h4>Accesos rápidos</h4>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => onNavigate('forums')}><i className="fas fa-comments me-2" />Foros</button>
              <button className="btn btn-primary" onClick={() => onNavigate('matchmaking')}><i className="fas fa-gamepad me-2" />Matchmaking</button>
              <button className="btn btn-primary" onClick={() => onNavigate('learning')}><i className="fas fa-graduation-cap me-2" />Aprender</button>
            </div>
          </div>
        </div>
      </div>

      <ProfileEditModal
        show={showEdit}
        onClose={() => setShowEdit(false)}
        currentData={user}
        onSave={(updated) => { onUpdateUser(updated); setShowEdit(false); }}
        existingUsernames={existingUsernames}
        onNotify={onNotify}
      />
    </section>
  );
};

export default DashboardSection;