import { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';

// Función para obtener actividades recientes del foro desde la API
const getRecentForumActivityFromAPI = async () => {
  try {
    const dashboardData = await getDashboardData();
    const activities = [];
    
    // Obtener últimos topics creados desde la API
    const recentTopics = (dashboardData.recentTopics || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
    
    recentTopics.forEach(topic => {
      activities.push({
        id: `topic-${topic.id}`,
        type: 'topic',
        title: topic.title,
        meta: `por ${topic.author_username}`,
        time: new Date(topic.created_at).getTime(),
        topicId: topic.id
      });
    });
    
    // Obtener últimas respuestas desde la API
    const recentPosts = (dashboardData.recentPosts || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
    
    recentPosts.forEach(post => {
      activities.push({
        id: `post-${post.id}`,
        type: 'reply',
        title: `Respuesta en tema`,
        meta: `por ${post.author_username}`,
        time: new Date(post.created_at).getTime(),
        topicId: post.topic_id
      });
    });
    
    // Ordenar todas las actividades por fecha y tomar las más recientes
    return activities
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);
      
  } catch (error) {
    console.error('Error fetching recent activity from API:', error);
    return [];
  }
};

// Función para formatear tiempo relativo
const getTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = Math.floor((now - timestamp) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return 'hace tiempo';
};

/*
 Props:
  - onNavigate(fn) optional: callback para navegar al hacer click en una actividad
  - items optional: array de eventos (si no, usa datos reales)
*/
const RecentActivity = ({ onNavigate, items }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde la API o usar los proporcionados
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        if (items) {
          setActivities(items);
        } else {
          const apiActivity = await getRecentForumActivityFromAPI();
          setActivities(apiActivity);
        }
      } catch (error) {
        console.error('Error loading recent activity:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [items]);

  const handleClick = (ev, activity) => {
    ev.preventDefault();
    if (typeof onNavigate === 'function' && activity.topicId) {
      // Navegar al topic específico usando el formato correcto
      onNavigate(`topic:${activity.topicId}`);
    }
  };



  return (
    <aside className="recent-activity card-custom p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{margin:0}}>Actividad reciente</h5>
      </div>

      <ul className="activity-list" style={{listStyle:'none', padding:0, margin:0}}>
        {loading ? (
          <li className="activity-item minimal">
            <div className="activity-content text-center">
              <i className="fas fa-spinner fa-spin"></i>
              <div style={{marginTop: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem'}}>
                Cargando actividad...
              </div>
            </div>
          </li>
        ) : activities.length > 0 ? (
          activities.map(activity => (
            <li key={activity.id} className="activity-item minimal" onClick={(e)=>handleClick(e, activity)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') handleClick(e,activity); }}>
              <div className="activity-content">
                <div className="activity-header">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-time">{getTimeAgo(activity.time)}</div>
                </div>
                <div className="activity-meta">{activity.meta}</div>
              </div>
            </li>
          ))
        ) : (
          <li className="text-muted text-center py-3">
            <small>No hay actividad reciente</small>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default RecentActivity;