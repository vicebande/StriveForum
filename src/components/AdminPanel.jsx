import { useState, useEffect, useCallback } from 'react';
import { 
  isAdmin, 
  getAllReports, 
  getAllUsers, 
  blockUser, 
  unblockUser, 
  getBlockedUsers,
  getUserActivityHistory,
  getUserTopicCount,
  getUserPostCount,
  getUserReports
} from '../utils/roleUtils';

const AdminPanel = ({ user, onNotify }) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  // const [sortBy, setSortBy] = useState('recent'); // TODO: Implement sorting functionality
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);

  const loadData = useCallback(() => {
    const allReports = getAllReports();
    const allUsers = getAllUsers();
    const blocked = getBlockedUsers();
    
    setReports(allReports);
    setUsers(allUsers);
    setBlockedUsers(blocked);
  }, []);

  useEffect(() => {
    if (user && isAdmin(user)) {
      loadData();
    }
  }, [user, loadData]);

  const handleBlockUser = (targetUsername, reason = 'Violación de las reglas del foro') => {
    if (window.confirm('¿Estás seguro de que deseas bloquear a este usuario?')) {
      const success = blockUser(targetUsername, user.username, reason);
      if (success) {
        loadData();
        if (onNotify) {
          onNotify({
            type: 'success',
            title: 'Usuario bloqueado',
            message: `El usuario ${targetUsername} ha sido bloqueado exitosamente.`
          });
        }
      }
    }
  };

  const handleUnblockUser = (targetUsername) => {
    if (window.confirm('¿Estás seguro de que deseas desbloquear a este usuario?')) {
      const success = unblockUser(targetUsername);
      if (success) {
        loadData();
        if (onNotify) {
          onNotify({
            type: 'success',
            title: 'Usuario desbloqueado',
            message: `El usuario ${targetUsername} ha sido desbloqueado exitosamente.`
          });
        }
      }
    }
  };

  const handleViewUserDetails = (username) => {
    const targetUser = users.find(u => u.username === username);
    if (targetUser) {
      const topicsCreated = getUserTopicCount(username);
      const postsCreated = getUserPostCount(username);
      const reportsReceived = getUserReports(username);
      const activity = getUserActivityHistory(username);

      const enrichedUser = {
        ...targetUser,
        topicsCreated,
        postsCreated,
        reportsReceived
      };

      setSelectedUser(enrichedUser);
      setUserActivity(activity);
      setActiveTab('userDetails');
    }
  };

  // Filtrar datos según búsqueda y filtros
  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = report.reportedUsername.toLowerCase().includes(searchLower) ||
                         report.reporterUsername.toLowerCase().includes(searchLower);
    const matchesFilter = filterType === 'all' || report.reason === filterType;
    
    // Filtro por fecha
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const reportDate = new Date(report.timestamp);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = reportDate.toDateString() === today.toDateString();
          break;
        case 'week': {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = reportDate >= weekAgo;
          break;
        }
        case 'month': {
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          matchesDate = reportDate >= monthAgo;
          break;
        }
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlockedUsers = blockedUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !isAdmin(user)) {
    return (
      <div className="unauthorized-access">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Acceso denegado</h4>
            <p>No tienes permisos suficientes para acceder a esta sección.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="admin-section">
      <div className="container">
        <div className="admin-panel-modern">
          {/* Header */}
          <div className="admin-title-section">
            <div className="admin-title-content">
              <h1><i className="fas fa-shield-alt"></i> Panel de Administración</h1>
              <p className="admin-subtitle">Gestión integral de usuarios, reportes y moderación del foro</p>
            </div>
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div className="stat-icon reports-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{reports.length}</span>
                  <span className="stat-label">Reportes Totales</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon users-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{users.length}</span>
                  <span className="stat-label">Usuarios Registrados</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blocked-icon">
                  <i className="fas fa-ban"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{blockedUsers.length}</span>
                  <span className="stat-label">Usuarios Bloqueados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="admin-tabs-modern">
            <button
              className={`admin-tab-modern ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <i className="fas fa-flag"></i>
              <span>Reportes</span>
              <span className="tab-badge">{filteredReports.length}</span>
            </button>
            <button
              className={`admin-tab-modern ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users"></i>
              <span>Usuarios</span>
              <span className="tab-badge">{filteredUsers.length}</span>
            </button>
            <button
              className={`admin-tab-modern ${activeTab === 'blocked' ? 'active' : ''}`}
              onClick={() => setActiveTab('blocked')}
            >
              <i className="fas fa-user-slash"></i>
              <span>Bloqueados</span>
              <span className="tab-badge">{filteredBlockedUsers.length}</span>
            </button>
            {selectedUser && (
              <button
                className={`admin-tab-modern ${activeTab === 'userDetails' ? 'active' : ''}`}
                onClick={() => setActiveTab('userDetails')}
              >
                <i className="fas fa-user-check"></i>
                <span>Detalles: {selectedUser.username}</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="admin-filters-modern">
            <div className="filters-row">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Buscar usuarios, reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {activeTab === 'reports' && (
                <>
                  <div className="filter-select">
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="filter-dropdown"
                    >
                      <option value="all">Todos los reportes</option>
                      <option value="spam">Spam</option>
                      <option value="harassment">Acoso</option>
                      <option value="inappropriate">Contenido inapropiado</option>
                      <option value="other">Otros</option>
                    </select>
                  </div>
                  <div className="filter-select">
                    <select 
                      value={dateFilter} 
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="filter-dropdown"
                    >
                      <option value="all">Todas las fechas</option>
                      <option value="today">Hoy</option>
                      <option value="week">Esta semana</option>
                      <option value="month">Este mes</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="admin-content-modern">
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="content-grid">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <div key={report.id} className="report-card-modern">
                      <div className="card-header">
                        <div className="report-info">
                          <h4>{report.reportedUsername}</h4>
                          <span className={`severity-badge severity-${report.reason}`}>
                            {report.reason}
                          </span>
                        </div>
                        <div className="report-date">
                          {new Date(report.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="detail-row">
                          <i className="fas fa-user-circle"></i>
                          <div>
                            <span className="detail-label">Reportado por</span>
                            <span className="detail-value">{report.reporterUsername}</span>
                          </div>
                        </div>
                        {report.description && (
                          <div className="detail-row">
                            <i className="fas fa-comment-alt"></i>
                            <div>
                              <span className="detail-label">Descripción</span>
                              <span className="detail-value">"{report.description}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="card-footer">
                        <button 
                          className="action-btn view-user"
                          onClick={() => handleViewUserDetails(report.reportedUsername)}
                        >
                          <i className="fas fa-eye"></i>
                          <span>Ver Usuario</span>
                        </button>
                        <button 
                          className="action-btn block-user"
                          onClick={() => handleBlockUser(report.reportedUsername, `Reportado por: ${report.reason}`)}
                        >
                          <i className="fas fa-ban"></i>
                          <span>Bloquear</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <h3>No hay reportes</h3>
                    <p>No se encontraron reportes que coincidan con los filtros</p>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="content-grid">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <div key={u.id || u.username} className="user-card-modern">
                      <div className="card-header">
                        <div className="user-info">
                          <div className="user-avatar">
                            {u.username[0].toUpperCase()}
                          </div>
                          <div className="user-details">
                            <h4>{u.username}</h4>
                            <p>{u.email}</p>
                            <span className={`role-badge ${u.role}`}>
                              <i className={`fas ${u.role === 'admin' ? 'fa-crown' : 'fa-user'}`}></i>
                              {u.role === 'admin' ? 'Admin' : 'Usuario'}
                            </span>
                          </div>
                        </div>
                        <div className={`status-indicator ${u.isBlocked ? 'blocked' : 'active'}`}>
                          <i className={`fas ${u.isBlocked ? 'fa-ban' : 'fa-check-circle'}`}></i>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="user-stats-grid">
                          <div className="user-stat">
                            <span className="stat-number">{getUserTopicCount(u.username) || 0}</span>
                            <span className="stat-label">Topics</span>
                          </div>
                          <div className="user-stat">
                            <span className="stat-number">{getUserPostCount(u.username) || 0}</span>
                            <span className="stat-label">Posts</span>
                          </div>
                          <div className="user-stat">
                            <span className="stat-number">{getUserReports(u.username)?.length || 0}</span>
                            <span className="stat-label">Reportes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-footer">
                        <button 
                          className="action-btn view-user"
                          onClick={() => handleViewUserDetails(u.username)}
                        >
                          <i className="fas fa-user-check"></i>
                          <span>Ver Detalles</span>
                        </button>
                        
                        {u.role !== 'admin' && !u.isBlocked && (
                          <button 
                            className="action-btn block"
                            onClick={() => handleBlockUser(u.username)}
                          >
                            <i className="fas fa-ban"></i>
                            <span>Bloquear</span>
                          </button>
                        )}
                        
                        {u.role !== 'admin' && u.isBlocked && (
                          <button 
                            className="action-btn unblock"
                            onClick={() => handleUnblockUser(u.username)}
                          >
                            <i className="fas fa-unlock"></i>
                            <span>Desbloquear</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>No hay usuarios</h3>
                    <p>No se encontraron usuarios que coincidan con la búsqueda</p>
                  </div>
                )}
              </div>
            )}

            {/* Blocked Users Tab */}
            {activeTab === 'blocked' && (
              <div className="content-grid">
                {filteredBlockedUsers.length > 0 ? (
                  filteredBlockedUsers.map((blockedUser) => (
                    <div key={blockedUser.username} className="blocked-user-card-modern">
                      <div className="card-header">
                        <div className="user-info">
                          <div className="user-avatar blocked">
                            {blockedUser.username[0].toUpperCase()}
                          </div>
                          <div className="user-details">
                            <h4>{blockedUser.username}</h4>
                            <p>Bloqueado por: {blockedUser.blockedBy}</p>
                            <span className="blocked-date">
                              {new Date(blockedUser.blockedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="detail-row">
                          <i className="fas fa-calendar-alt"></i>
                          <div>
                            <span className="detail-label">Fecha de bloqueo</span>
                            <span className="detail-value">{new Date(blockedUser.blockedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {blockedUser.reason && (
                          <div className="detail-row">
                            <i className="fas fa-info-circle"></i>
                            <div>
                              <span className="detail-label">Razón</span>
                              <span className="detail-value">{blockedUser.reason}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-footer">
                        <button 
                          className="action-btn view-user"
                          onClick={() => handleViewUserDetails(blockedUser.username)}
                        >
                          <i className="fas fa-user-check"></i>
                          <span>Ver Detalles</span>
                        </button>
                        
                        <button 
                          className="action-btn unblock"
                          onClick={() => handleUnblockUser(blockedUser.username)}
                        >
                          <i className="fas fa-unlock"></i>
                          <span>Desbloquear usuario</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-user-check"></i>
                    <h3>No hay usuarios bloqueados</h3>
                    <p>Actualmente no hay usuarios bloqueados en el sistema</p>
                  </div>
                )}
              </div>
            )}

            {/* User Details Tab */}
            {activeTab === 'userDetails' && selectedUser && (
              <div className="user-details-section-modern">
                <div className="user-details-close-btn-container">
                  <button 
                    className="user-details-close-btn"
                    onClick={() => {
                      setSelectedUser(null);
                      setActiveTab('reports');
                    }}
                    title="Cerrar detalles del usuario"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="user-details-header">
                  <div className="user-details-avatar">
                    {selectedUser.username[0].toUpperCase()}
                  </div>
                  <div className="user-details-info">
                    <h2>{selectedUser.username}</h2>
                    <p>{selectedUser.email}</p>
                    <div className="user-status-badges">
                      <span className={`status-badge ${selectedUser.role}`}>
                        <i className={`fas ${selectedUser.role === 'admin' ? 'fa-crown' : 'fa-user'}`}></i>
                        {selectedUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                      <span className={`status-badge ${selectedUser.isBlocked ? 'blocked' : 'active'}`}>
                        <i className={`fas ${selectedUser.isBlocked ? 'fa-ban' : 'fa-check-circle'}`}></i>
                        {selectedUser.isBlocked ? 'Bloqueado' : 'Activo'}
                      </span>
                    </div>
                  </div>
                  <div className="user-actions-header">
                    {selectedUser.role !== 'admin' && (
                      <button 
                        className={`action-btn ${selectedUser.isBlocked ? 'unblock' : 'block'}`}
                        onClick={() => selectedUser.isBlocked ? 
                          handleUnblockUser(selectedUser.username) : 
                          handleBlockUser(selectedUser.username)
                        }
                      >
                        <i className={`fas ${selectedUser.isBlocked ? 'fa-unlock' : 'fa-ban'}`}></i>
                        <span>{selectedUser.isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="user-details-grid">
                  <div className="user-stats-panel">
                    <h3><i className="fas fa-chart-bar"></i> Estadísticas</h3>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-icon topics">
                          <i className="fas fa-comments"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-number">{selectedUser.topicsCreated || 0}</span>
                          <span className="stat-label">Topics creados</span>
                        </div>
                      </div>
                      
                      <div className="stat-box">
                        <div className="stat-icon posts">
                          <i className="fas fa-reply"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-number">{selectedUser.postsCreated || 0}</span>
                          <span className="stat-label">Posts/Respuestas</span>
                        </div>
                      </div>
                      
                      <div className="stat-box">
                        <div className="stat-icon reports">
                          <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-number">{selectedUser.reportsReceived?.length || 0}</span>
                          <span className="stat-label">Reportes recibidos</span>
                        </div>
                      </div>
                      
                      <div className="stat-box">
                        <div className="stat-icon join-date">
                          <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="stat-info">
                          <span className="stat-number">
                            {selectedUser.registeredAt ? 
                              new Date(selectedUser.registeredAt).toLocaleDateString() : 
                              'Fecha no disponible'
                            }
                          </span>
                          <span className="stat-label">Fecha de registro</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="user-reports-panel">
                    <h3><i className="fas fa-flag"></i> Reportes Recibidos ({selectedUser.reportsReceived?.length || 0})</h3>
                    {selectedUser.reportsReceived?.length > 0 ? (
                      <div className="reports-list">
                        {selectedUser.reportsReceived.map((report, index) => (
                          <div key={index} className="report-item">
                            <div className="report-item-header">
                              <span className={`severity-badge severity-${report.reason}`}>
                                {report.reason}
                              </span>
                              <span className="report-date">
                                {new Date(report.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="report-item-body">
                              <p><strong>Reportado por:</strong> {report.reporterUsername}</p>
                              {report.description && (
                                <p className="report-description">"{report.description}"</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-reports">
                        <i className="fas fa-check-circle"></i>
                        <p>Este usuario no tiene reportes</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="user-activity-panel">
                  <div className="activity-panel-header">
                    <h3><i className="fas fa-history"></i> Actividad Reciente ({userActivity.length} acciones)</h3>
                    {userActivity.length > 3 && (
                      <div className="scroll-indicator">
                        <i className="fas fa-chevron-down"></i>
                        <span>Desliza para ver más</span>
                      </div>
                    )}
                  </div>
                  {userActivity.length > 0 ? (
                    <div className="activity-timeline-container">
                      <div className="activity-timeline">
                        {userActivity.map((activity, index) => (
                          <div key={index} className={`activity-item activity-${activity.type}`}>
                            <div className={`activity-icon icon-${activity.type}`}>
                              <i className={`fas ${
                                activity.type === 'topic_created' ? 'fa-plus-circle' :
                                activity.type === 'post_created' ? 'fa-reply' :
                                activity.type === 'reported' ? 'fa-flag' : 'fa-circle'
                              }`}></i>
                            </div>
                            <div className="activity-content">
                              <div className="activity-header">
                                <div className="activity-title">
                                  {activity.type === 'topic_created' && (
                                    <>
                                      <span className="action-label">Creó un topic:</span>
                                      <span className="content-title">"{activity.title}"</span>
                                      {activity.category && (
                                        <span className="category-badge">{activity.category}</span>
                                      )}
                                    </>
                                  )}
                                  {activity.type === 'post_created' && (
                                    <>
                                      <span className="action-label">Respondió en:</span>
                                      <span className="content-title">"{activity.topicTitle || activity.title}"</span>
                                    </>
                                  )}
                                  {activity.type === 'reported' && (
                                    <>
                                      <span className="action-label">Fue reportado por:</span>
                                      <span className="content-title">{activity.title}</span>
                                      <span className={`severity-badge severity-${activity.reason}`}>
                                        {activity.reason}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="activity-time">
                                  <i className="fas fa-clock"></i>
                                  {new Date(activity.timestamp).toLocaleString()}
                                </div>
                              </div>
                              
                              {activity.content && (
                                <div className="activity-content-preview">
                                  <div className="content-text">
                                    {activity.content.length > 200 
                                      ? `${activity.content.substring(0, 200)}...` 
                                      : activity.content
                                    }
                                  </div>
                                  {activity.content.length > 200 && (
                                    <button className="expand-btn" onClick={(e) => {
                                      const preview = e.target.closest('.activity-content-preview');
                                      const contentText = preview.querySelector('.content-text');
                                      const btn = e.target;
                                      
                                      if (preview.classList.contains('expanded')) {
                                        preview.classList.remove('expanded');
                                        contentText.textContent = activity.content.substring(0, 200) + '...';
                                        btn.textContent = 'Ver más';
                                      } else {
                                        preview.classList.add('expanded');
                                        contentText.textContent = activity.content;
                                        btn.textContent = 'Ver menos';
                                      }
                                    }}>
                                      Ver más
                                    </button>
                                  )}
                                </div>
                              )}

                              <div className="activity-stats">
                                {activity.type === 'topic_created' && (
                                  <>
                                    <span className="stat-item">
                                      <i className="fas fa-replies"></i>
                                      {Number.isInteger(activity.replies) ? activity.replies : 0} respuestas
                                    </span>
                                  </>
                                )}
                                {activity.type === 'post_created' && activity.topicId && (
                                  <span className="stat-item">
                                    <i className="fas fa-link"></i>
                                    ID del Topic: {Number.isInteger(activity.topicId) ? activity.topicId : 'N/A'}
                                  </span>
                                )}
                                {activity.type === 'reported' && activity.reason && (
                                  <span className="stat-item">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    Motivo: {activity.reason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-activity">
                      <div className="empty-icon">
                        <i className="fas fa-ghost"></i>
                      </div>
                      <h4>Sin actividad registrada</h4>
                      <p>Este usuario aún no ha creado contenido en el foro</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;