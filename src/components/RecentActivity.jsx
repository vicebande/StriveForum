/*
 Props:
  - onNavigate(fn) optional: callback para navegar al hacer click en una actividad
  - items optional: array de eventos (si no, usa datos fake)
*/
const RecentActivity = ({ onNavigate, items }) => {
  const sample = items || [
    { id: 'a1', type: 'post', title: 'Nuevo post: Guías avanzadas', meta: 'en Guías y combos', time: Date.now() - 1000*60*30 },
    { id: 'a2', type: 'reply', title: 'Respuesta a tu publicación', meta: 'en Foros', time: Date.now() - 1000*60*60*3 },
    { id: 'a3', type: 'topic', title: 'Tema creado: Torneos locales', meta: 'por Admin', time: Date.now() - 1000*60*60*24 },
  ];

  const handleClick = (ev, item) => {
    ev.preventDefault();
    if (typeof onNavigate === 'function') {
      // ejemplo: navegar a topic genérico o sección según type
      if (item.type === 'post') onNavigate('forums');
      else if (item.type === 'reply') onNavigate('forums');
      else onNavigate('forums');
    }
  };

  const timeAgo = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff/60)}m`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h`;
    return `${Math.floor(diff/86400)}d`;
  };

  return (
    <aside className="recent-activity card-custom p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 style={{margin:0}}>Actividad reciente</h5>
        <small className="text-muted">Hoy</small>
      </div>

      <ul className="activity-list" style={{listStyle:'none', padding:0, margin:0}}>
        {sample.map(it => (
          <li key={it.id} className="activity-item" onClick={(e)=>handleClick(e, it)} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') handleClick(e,it); }}>
            <div className="activity-avatar">{it.type === 'reply' ? 'R' : it.type === 'post' ? 'P' : 'T'}</div>
            <div className="activity-body">
              <div className="activity-title">{it.title}</div>
              <div className="activity-meta">{it.meta} · <span className="activity-time">{timeAgo(it.time)}</span></div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default RecentActivity;