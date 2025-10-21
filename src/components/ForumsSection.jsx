import React, { useState, useCallback } from 'react';

const ForumsSection = ({ onNotify, onNavigate }) => {
  const [sortBy, setSortBy] = useState('hot'); // hot, new, top

  const initialTopics = [
    { 
      id: 't1', 
      title: 'Guías y combos para principiantes', 
      description: 'Mejores combos para empezar en Guilty Gear Strive',
      author: 'Admin',
      authorAvatar: 'A',
      createdAt: Date.now()-1000*60*60*24*10,
      upvotes: 142,
      downvotes: 8,
      comments: 23,
      category: 'Guías'
    },
    { 
      id: 't3', 
      title: '¿Qué personaje recomiendan para empezar?', 
      description: 'Soy nuevo en fighting games y no sé por dónde empezar',
      author: 'Newbie123',
      authorAvatar: 'N',
      createdAt: Date.now()-1000*60*60*6,
      upvotes: 67,
      downvotes: 2,
      comments: 42,
      category: 'Discusión'
    },
  ];

  const [topics, setTopics] = useState(initialTopics);

  const handleSort = (type) => {
    setSortBy(type);
    
    // Crear una copia de los topics para ordenar
    const sortedTopics = [...topics];
    
    switch (type) {
      case 'hot':
        // Ordenar por score (upvotes - downvotes) y comentarios
        sortedTopics.sort((a, b) => {
          const scoreA = (a.upvotes || 0) - (a.downvotes || 0) + (a.comments || 0) * 0.5;
          const scoreB = (b.upvotes || 0) - (b.downvotes || 0) + (b.comments || 0) * 0.5;
          return scoreB - scoreA;
        });
        break;
      case 'new':
        // Ordenar por fecha de creación (más reciente primero)
        sortedTopics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'top':
        // Ordenar solo por upvotes
        sortedTopics.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      default:
        break;
    }
    
    setTopics(sortedTopics);
    
    if (onNotify) onNotify({ 
      type: 'success', 
      title: 'Ordenamiento actualizado', 
      message: `Ordenado por: ${type === 'hot' ? 'Populares' : type === 'new' ? 'Recientes' : 'Más votados'}` 
    });
  };

    const getCurrentUser = useCallback(() => {
    try {
      const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
      return session.user || null;
    } catch {
      return null;
    }
  }, []);

  const getUserVoteStatus = useCallback((topicId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    try {
      const userVotes = JSON.parse(localStorage.getItem('sf_user_votes') || '{}');
      const userVoteKey = `${currentUser.id}_${topicId}`;
      return userVotes[userVoteKey] || null;
    } catch {
      return null;
    }
  }, [getCurrentUser]);

  const handleVote = useCallback((topicId, voteType) => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para votar'
      });
      return;
    }

    // Obtener votos del usuario
    let userVotes = JSON.parse(localStorage.getItem('sf_user_votes') || '{}');
    const userVoteKey = `${currentUser.id}_${topicId}`;
    const previousVote = userVotes[userVoteKey];

    // Actualizar el estado local inmediatamente
    setTopics(prev => prev.map(topic => {
      if (topic.id === topicId) {
        const updatedTopic = { ...topic };
        
        // Remover voto anterior si existe
        if (previousVote) {
          if (previousVote === 'up') {
            updatedTopic.upvotes = Math.max(0, (updatedTopic.upvotes || 0) - 1);
          } else {
            updatedTopic.downvotes = Math.max(0, (updatedTopic.downvotes || 0) - 1);
          }
        }
        
        // Aplicar nuevo voto o remover si es el mismo
        if (previousVote === voteType) {
          // Remover voto
          delete userVotes[userVoteKey];
        } else {
          // Agregar nuevo voto
          userVotes[userVoteKey] = voteType;
          if (voteType === 'up') {
            updatedTopic.upvotes = (updatedTopic.upvotes || 0) + 1;
          } else {
            updatedTopic.downvotes = (updatedTopic.downvotes || 0) + 1;
          }
        }
        
        return updatedTopic;
      }
      return topic;
    }));

    // Guardar votos en localStorage
    localStorage.setItem('sf_user_votes', JSON.stringify(userVotes));
    
    // También actualizar en el localStorage de posts para consistencia
    let storedData = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
    Object.keys(storedData).forEach(categoryId => {
      if (storedData[categoryId] && Array.isArray(storedData[categoryId])) {
        const topicIndex = storedData[categoryId].findIndex(t => t.id === topicId);
        if (topicIndex !== -1) {
          const topic = storedData[categoryId][topicIndex];
          
          // Aplicar la misma lógica de votación
          if (previousVote) {
            if (previousVote === 'up') {
              topic.upvotes = Math.max(0, (topic.upvotes || 0) - 1);
            } else {
              topic.downvotes = Math.max(0, (topic.downvotes || 0) - 1);
            }
          }
          
          if (previousVote !== voteType) {
            if (voteType === 'up') {
              topic.upvotes = (topic.upvotes || 0) + 1;
            } else {
              topic.downvotes = (topic.downvotes || 0) + 1;
            }
          }
          
          storedData[categoryId][topicIndex] = topic;
        }
      }
    });
    
    localStorage.setItem('sf_postsMap', JSON.stringify(storedData));

    if (onNotify) {
      const action = userVotes[userVoteKey] ? 'registrado' : 'removido';
      onNotify(`Voto ${action} correctamente`, 'success');
    }
  }, [getCurrentUser, onNotify]);



  const handleShare = async (e, topic) => {
    e.stopPropagation();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para compartir contenido'
      });
      return;
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: topic.title,
          text: topic.description,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          onNotify && onNotify({ type: 'info', title: 'Compartir', message: 'No se pudo compartir' });
        }
      }
    } else {
      onNotify && onNotify({ type: 'info', title: 'Compartir', message: 'Función no soportada en este navegador' });
    }
  };

  const timeAgo = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff/60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`;
    return `hace ${Math.floor(diff/86400)}d`;
  };

  return (
    <section id="forumsSection" className="content-section forums-reddit" style={{paddingTop:90}}>
      <div className="container">
        <div className="forums-header mb-4">
          <h2><i className="fas fa-comments"></i> Foros de la Comunidad</h2>
          <p className="text-muted">Comparte estrategias, encuentra compañeros y únete a la discusión</p>
        </div>

        {/* Sort bar estilo Reddit */}
        <div className="forums-sort-bar mb-3">
          <div className="sort-buttons">
            <button 
              className={`sort-btn ${sortBy === 'hot' ? 'active' : ''}`} 
              onClick={() => handleSort('hot')}
              aria-pressed={sortBy === 'hot'}
            >
              <i className="fas fa-fire" aria-hidden="true"></i> Popular
            </button>
            <button 
              className={`sort-btn ${sortBy === 'new' ? 'active' : ''}`} 
              onClick={() => handleSort('new')}
              aria-pressed={sortBy === 'new'}
            >
              <i className="fas fa-clock" aria-hidden="true"></i> Nuevo
            </button>
            <button 
              className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`} 
              onClick={() => handleSort('top')}
              aria-pressed={sortBy === 'top'}
            >
              <i className="fas fa-arrow-up" aria-hidden="true"></i> Top
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
              if (onNotify) onNotify({
                type: 'warning',
                title: 'Acceso requerido',
                message: 'Debes iniciar sesión para crear un nuevo topic'
              });
              return;
            }
            onNavigate('topic:new');
          }}>
            <i className="fas fa-plus me-2" aria-hidden="true"></i> Crear Topic
          </button>
        </div>

        {/* Lista de topics estilo Reddit */}
        <div className="topics-list">
          {topics.map(topic => {
            const score = topic.upvotes - topic.downvotes;
            return (
              <div 
                key={topic.id} 
                className="topic-card-reddit"
                onClick={() => onNavigate(`topic:${topic.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onNavigate(`topic:${topic.id}`); }}
              >
                {/* Voting sidebar */}
                <div className="vote-sidebar">
                  {(() => {
                    const userVote = getUserVoteStatus(topic.id);
                    return (
                      <>
                        <button 
                          className={`vote-btn upvote ${userVote === 'up' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(topic.id, 'up');
                          }}
                          aria-label="Upvote"
                          title="Votar positivo"
                        >
                          <i className="fas fa-arrow-up"></i>
                        </button>
                        <span className="vote-score" aria-live="polite">{score}</span>
                        <button 
                          className={`vote-btn downvote ${userVote === 'down' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(topic.id, 'down');
                          }}
                          aria-label="Downvote"
                          title="Votar negativo"
                        >
                          <i className="fas fa-arrow-down"></i>
                        </button>
                      </>
                    );
                  })()}
                </div>

                {/* Content */}
                <div className="topic-content">
                  <div className="topic-meta">
                    <span className="topic-category">{topic.category}</span>
                    <span className="topic-author">
                      <span className="author-avatar" aria-hidden="true">{topic.authorAvatar}</span>
                      u/{topic.author}
                    </span>
                    <span className="topic-time">{timeAgo(topic.createdAt)}</span>
                  </div>

                  <h3 className="topic-title">{topic.title}</h3>
                  <p className="topic-description">{topic.description}</p>

                  <div className="topic-actions">
                    <button 
                      className="action-btn comments" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        const currentUser = getCurrentUser();
                        if (!currentUser) {
                          if (onNotify) onNotify({
                            type: 'warning',
                            title: 'Acceso requerido',
                            message: 'Debes iniciar sesión para participar en las discusiones'
                          });
                          return;
                        }
                        onNavigate(`topic:${topic.id}`); 
                      }}
                      aria-label={`${topic.comments} comentarios`}
                    >
                      <i className="fas fa-comment" aria-hidden="true"></i> {topic.comments} comentarios
                    </button>
                    <button 
                      className="action-btn share" 
                      onClick={(e) => handleShare(e, topic)}
                      aria-label="Compartir tema"
                    >
                      <i className="fas fa-share-alt" aria-hidden="true"></i> Compartir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ForumsSection;