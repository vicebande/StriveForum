import React, { useMemo, useState } from 'react';
import PostModal from './modals/PostModal';
import CreateTopicModal from './modals/CreateTopicModal';
import PostThreadModal from './modals/PostThreadModal';
import NewPostModal from './modals/NewPostModal'; // <-- nuevo

const fakeTopics = [
  {
    id: 't1',
    title: 'Guías y combos',
    description: 'Mejores combos para principiantes y tutoriales paso a paso.',
    author: 'Admin',
    createdAt: Date.now() - 1000*60*60*24*10
  },
  {
    id: 't2',
    title: 'Matchmaking y rankeds',
    description: 'Encuentra compañeros y organiza partidas competitivas.',
    author: 'PlayerOne',
    createdAt: Date.now() - 1000*60*60*24*3
  }
];

const fakePosts = {
  t1: [
    { id: 'p1', author: 'UserA', message: '¿Alguien tiene un combo simple para Ky?', createdAt: Date.now()-1000*60*60*24*2, replies: [
      { id: 'r1', author: 'Coach', message: 'Prueba: LP → MP → special', createdAt: Date.now()-1000*60*60*24 }
    ] },
    { id: 'p2', author: 'UserB', message: '¿Qué botones usar para starter combos?', createdAt: Date.now()-1000*60*60*24*5, replies: [] }
  ],
  t2: [
    { id: 'p3', author: 'MatchHunter', message: 'Busco team para rankeds nocturnos', createdAt: Date.now()-1000*60*60*6, replies: [] }
  ]
};

const TopicSection = ({ currentTopicId, onNavigate, onNotify, user }) => {
  const [topics, setTopics] = useState(fakeTopics);
  const [postsMap, setPostsMap] = useState(fakePosts);

  // modal states
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showThreadModal, setShowThreadModal] = useState(false);
  const [activeThreadPost, setActiveThreadPost] = useState(null);

  const [showNewPostModal, setShowNewPostModal] = useState(false); // <-- modal para crear post dentro de un topic

  const topic = useMemo(() => topics.find(t => t.id === currentTopicId), [topics, currentTopicId]);

  const openCreateTopic = () => {
    setShowCreateModal(true);
  };

  const openReply = (postId = null) => {
    setReplyTo(postId);
    setShowReplyModal(true);
  };

  const openNewPost = () => {
    setShowNewPostModal(true);
  };

  const openThread = (post) => {
    setActiveThreadPost(post);
    setShowThreadModal(true);
  };

  const handleCreateTopic = ({ title, description, message }) => {
    const id = 't' + (Date.now().toString(36).slice(-6));
    const newTopic = { id, title, description, author: user?.username || 'Anon', createdAt: Date.now() };
    setTopics(t => [newTopic, ...t]);
    setPostsMap(m => ({ ...m, [id]: [{ id: 'p' + Date.now().toString(36), author: user?.username || 'Anon', message, createdAt: Date.now(), replies: [] }] }));
    setShowCreateModal(false);
    if (onNotify) onNotify({ type: 'success', title: 'Topic creado', message: title });
    if (typeof onNavigate === 'function') onNavigate(`topic:${id}`);
  };

  const handleReplySubmit = ({ message }) => {
    if (!currentTopicId) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'No hay topic seleccionado.' });
      return;
    }
    setPostsMap(prev => {
      const copy = { ...prev };
      if (replyTo) {
        copy[currentTopicId] = (copy[currentTopicId] || []).map(p => {
          if (p.id === replyTo) {
            return { ...p, replies: [...(p.replies || []), { id: 'r' + Date.now().toString(36), author: user?.username || 'Anon', message, createdAt: Date.now() }] };
          }
          return p;
        });
      } else {
        const newPost = { id: 'p' + Date.now().toString(36), author: user?.username || 'Anon', message, createdAt: Date.now(), replies: [] };
        copy[currentTopicId] = [newPost, ...(copy[currentTopicId] || [])];
      }
      return copy;
    });
    setShowReplyModal(false);
    if (onNotify) onNotify({ type: 'info', title: 'Publicación creada', message: 'Tu publicación fue añadida.' });
  };

  // nuevo handler para publicar dentro del topic (usa title+description+message)
  const handleNewPostSubmit = ({ title, description, message }) => {
    if (!currentTopicId) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'No hay topic seleccionado.' });
      setShowNewPostModal(false);
      return;
    }
    setPostsMap(prev => {
      const copy = { ...prev };
      const newPost = {
        id: 'p' + Date.now().toString(36),
        author: user?.username || 'Anon',
        title,
        description,
        message,
        createdAt: Date.now(),
        replies: []
      };
      copy[currentTopicId] = [newPost, ...(copy[currentTopicId] || [])];
      return copy;
    });
    setShowNewPostModal(false);
    if (onNotify) onNotify({ type: 'success', title: 'Publicación creada', message: 'Tu publicación fue añadida.' });
  };

  // renders
  if (!currentTopicId) {
    return (
      <section className="content-section" style={{paddingTop:90}}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2><i className="fas fa-comments"></i> Temas</h2>
            <div>
              <button className="btn btn-primary me-2" onClick={openCreateTopic}>Crear Topic</button>
              <button className="btn btn-secondary" onClick={() => { if (typeof onNavigate === 'function') onNavigate('forums'); }}>Volver a categorías</button>
            </div>
          </div>

          <div>
            {topics.map(t => (
              <div key={t.id} className="forum-category p-3 mb-2" style={{cursor:'pointer'}} onClick={() => { if (typeof onNavigate === 'function') onNavigate(`topic:${t.id}`); }}>
                <div className="d-flex justify-content-between">
                  <div>
                    <strong style={{fontSize:16}}>{t.title}</strong>
                    <div className="small text-muted">{t.description}</div>
                  </div>
                  <div className="small text-muted">Por {t.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CreateTopicModal show={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateTopic} onNotify={onNotify} />
      </section>
    );
  }

  const posts = postsMap[currentTopicId] || [];

  return (
    <section className="content-section topic-section" style={{paddingTop:90}}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-start mb-3 header-row">
          <div>
            <h2 className="topic-title">{topic?.title || 'Tema'}</h2>
            <div className="topic-desc small text-muted">{topic?.description || 'Descripción no disponible.'}</div>
          </div>
          <div className="header-actions">
            <button className="btn btn-link me-2" onClick={() => { if (typeof onNavigate === 'function') onNavigate('forums'); }}>Volver a foros</button>
            <button className="btn btn-link" onClick={openNewPost}>Nuevo Post</button> {/* abre NewPostModal */}
          </div>
        </div>

        <div>
          {posts.length === 0 && (
            <div className="card-custom p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center post-empty">
                <div>
                  <strong className="text-white">No hay mensajes todavía.</strong>
                  <div className="small topic-muted">Sé el primero en crear una publicación en este tema.</div>
                </div>
                <div>
                  <button className="btn btn-link btn-success-like" onClick={openNewPost}>Crear primer post</button>
                </div>
              </div>
            </div>
          )}

          {posts.map(p => (
            <div key={p.id} className="card-custom p-3 mb-3 post-row" style={{cursor:'pointer'}} onClick={() => openThread(p)}>
              <div className="d-flex justify-content-between">
                <div style={{minWidth:0}}>
                  <div className="post-meta">
                    <strong className="post-author">{p.author}</strong>{' '}
                    <span className="post-date small text-muted">• {new Date(p.createdAt).toLocaleString()}</span>
                  </div>

                  <div style={{marginTop:8, wordBreak:'break-word'}} className="post-content">
                    {p.title ? (
                      <>
                        <div className="post-title"><strong>{p.title}</strong></div>
                        <div className="post-subdesc small text-muted">{p.description}</div>
                      </>
                    ) : null}
                    <div className="post-message">{p.message}</div>
                  </div>
                </div>
                <div className="text-end">
                  <button className="btn btn-link btn-sm" onClick={(e) => { e.stopPropagation(); openReply(p.id); }}>Responder</button>
                </div>
              </div>

              {p.replies && p.replies.length > 0 && (
                <div style={{marginTop:12, marginLeft:18}}>
                  {p.replies.map(r => (
                    <div key={r.id} className="card-custom p-2 mb-2 reply-card">
                      <div className="small"><strong className="reply-author">{r.author}</strong> <span className="small post-date">• {new Date(r.createdAt).toLocaleString()}</span></div>
                      <div style={{marginTop:6}} className="reply-message">{r.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button className="fab-post" title="Nuevo post" onClick={openNewPost} aria-label="Nuevo post">
        <i className="fas fa-plus" />
      </button>

      {/* modales */}
      <PostModal show={showReplyModal} mode="reply" onClose={() => setShowReplyModal(false)} onSubmit={({ message }) => handleReplySubmit({ message })} onNotify={onNotify} />
      <NewPostModal show={showNewPostModal} onClose={() => setShowNewPostModal(false)} onSubmit={handleNewPostSubmit} onNotify={onNotify} />
      <CreateTopicModal show={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateTopic} onNotify={onNotify} />
      <PostThreadModal show={showThreadModal} onClose={() => setShowThreadModal(false)} post={activeThreadPost} onReply={(postId) => { setShowThreadModal(false); setTimeout(()=> openReply(postId), 120); }} />
    </section>
  );
};

export default TopicSection;