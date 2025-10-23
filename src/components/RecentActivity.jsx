import { useMemo } from 'react';

// Función para obtener actividades recientes del foro
const getRecentForumActivity = () => {
  const topics = JSON.parse(localStorage.getItem('sf_topics') || '[]');
  const postsMap = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
  
  const activities = [];
  
  // Obtener últimos topics creados
  const recentTopics = topics
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  
  recentTopics.forEach(topic => {
    activities.push({
      id: `topic-${topic.id}`,
      type: 'topic',
      title: topic.title,
      meta: `por ${topic.author}`,
      time: new Date(topic.createdAt).getTime(),
      topicId: topic.id
    });
  });
  
  // Obtener últimas respuestas
  const recentPosts = [];
  Object.entries(postsMap).forEach(([topicId, posts]) => {
    if (Array.isArray(posts)) {
      posts.forEach(post => {
        const topic = topics.find(t => t.id === parseInt(topicId));
        if (topic) {
          recentPosts.push({
            id: `post-${post.id || Date.now()}-${topicId}`,
            type: 'reply',
            title: `Respuesta en "${topic.title}"`,
            meta: `por ${post.author}`,
            time: new Date(post.createdAt).getTime(),
            topicId: parseInt(topicId)
          });
        }
      });
    }
  });
  
  // Agregar posts recientes
  const sortedPosts = recentPosts
    .sort((a, b) => b.time - a.time)
    .slice(0, 4);
  
  activities.push(...sortedPosts);
  
  // Ordenar todas las actividades por fecha y tomar las más recientes
  return activities
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);
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
  // Usar datos reales si no se proporcionan items
  const realActivity = useMemo(() => {
    return getRecentForumActivity();
  }, []);

  const activities = items || realActivity;

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
        {activities.length > 0 ? (
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