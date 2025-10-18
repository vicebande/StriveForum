import React from 'react';

const ForumsSection = ({ onNotify, onNavigate }) => {
  const sampleTopics = [
    { id: 't1', title: 'Guías y combos', description: 'Mejores combos para principiantes', author: 'Admin', createdAt: Date.now()-1000*60*60*24*10 },
    { id: 't2', title: 'Matchmaking y rankeds', description: 'Busca compañeros y rivales', author: 'User42', createdAt: Date.now()-1000*60*60*24*3 }
  ];

  const createTopic = (title = 'Nuevo tema de ejemplo') => {
    if (onNotify) onNotify({ type: 'info', title: 'Topic creado', message: `Se creó: ${title}` });
  };

  const notifyReply = (topic = 'Tema ejemplo') => {
    if (onNotify) onNotify({ type: 'info', title: 'Respuesta', message: `Nueva respuesta en: ${topic}` });
  };

  const handleNavigate = (target) => {
    if (typeof onNavigate === 'function') {
      onNavigate(target);
    } else {
      // fallback: log para depuración (no rompe la app)
      console.error('ForumsSection: onNavigate no fue recibido. target=', target);
    }
  };

  return (
    <section id="forumsSection" className="content-section" style={{paddingTop:90}}>
      <div className="container">
        <h2 className="mb-4"><i className="fas fa-comments"></i> Categorías del Foro</h2>

        <div style={{marginBottom:12}}>
          <button className="btn btn-primary me-2" onClick={() => createTopic('Guías y combos')}>Crear topic (demo)</button>
          <button className="btn btn-secondary" onClick={() => notifyReply('Guías y combos')}>Simular respuesta</button>
        </div>

        <div className="row">
          <div className="col-12">
            {sampleTopics.map(t => (
              <div
                key={t.id}
                className="forum-category p-4 mb-3"
                style={{cursor:'pointer'}}
                onClick={() => handleNavigate(`topic:${t.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate(`topic:${t.id}`); }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4><i className="fas fa-gamepad text-primary me-2"></i> {t.title}</h4>
                    <p className="mb-0 text-muted">{t.description}</p>
                    <div className="small text-muted" style={{marginTop:8}}>Por {t.author} • {new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-primary">Ver</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForumsSection;