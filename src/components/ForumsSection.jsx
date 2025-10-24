import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTopicModal from './modals/CreateTopicModal';
import { checkUserPermission, isUserBlocked, handleTopicVote, validateAndCleanVoteData } from '../utils/roleUtils';
import { shareTopicUrl } from '../utils/shareUtils';
import { 
  TOPICS_KEY, 
  POSTS_KEY, 
  safeStorageGet, 
  safeStorageSet 
} from '../utils/storage';

const ForumsSection = ({ onNotify }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('hot'); // hot, new, top
  const [votingInProgress, setVotingInProgress] = useState(new Set());
  const [lastVoteTime, setLastVoteTime] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [topics, setTopics] = useState(() => {
    console.log('🔄 ForumsSection: Initializing topics from storage');
    const storedTopics = safeStorageGet(TOPICS_KEY, []);
    console.log('📂 ForumsSection: Loaded topics:', storedTopics);
    
    // Validar y limpiar datos de votos para prevenir valores negativos
    validateAndCleanVoteData();
    
    return storedTopics;
  });

  // useEffect para limpiar datos de localStorage solo al montar el componente
  useEffect(() => {
    console.log('🔄 ForumsSection: Component mounted');
    
    // Validar y limpiar datos una sola vez al cargar
    validateAndCleanVoteData();
    
    // Sincronizar topics desde localStorage
    const syncTopicsFromStorage = () => {
      const storageTopics = safeStorageGet(TOPICS_KEY, []);
      console.log('🔄 ForumsSection: Syncing topics from storage:', storageTopics);
      
      // Solo actualizar si hay cambios reales
      setTopics(prevTopics => {
        const currentDataStr = JSON.stringify(prevTopics);
        const storageDataStr = JSON.stringify(storageTopics);
        
        if (currentDataStr !== storageDataStr) {
          console.log('📝 ForumsSection: Topics state updated from storage');
          return storageTopics;
        }
        return prevTopics;
      });
    };

    // Listener para cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === TOPICS_KEY) {
        console.log('🔔 ForumsSection: localStorage change detected for topics');
        syncTopicsFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // No incluir topics para evitar loops

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

  // Función para validar que un usuario no pueda votar múltiples veces
  const validateVoteAttempt = useCallback((_topicId, _voteType) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) {
        onNotify({
          type: 'warning',
          message: 'Debes iniciar sesión para votar'
        });
      }
      return false;
    }
    
    // La validación específica se hace en handleVote
    // Esta función actúa como un filtro previo simple
    return true;
  }, [getCurrentUser, onNotify]);

  // Función para crear un nuevo topic desde ForumsSection
  const handleCreateTopic = useCallback(({ title, content, category }) => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para crear un topic'
      });
      return;
    }

    // Verificar si el usuario está bloqueado
    if (isUserBlocked(currentUser.username)) {
      if (onNotify) onNotify({
        type: 'error',
        title: 'Cuenta suspendida',
        message: 'Tu cuenta ha sido suspendida y no puedes crear contenido'
      });
      return;
    }

    // Verificar permisos específicos
    if (!checkUserPermission(currentUser.username, 'CREATE_TOPIC')) {
      if (onNotify) onNotify({
        type: 'error',
        title: 'Sin permisos',
        message: 'No tienes permisos para crear topics'
      });
      return;
    }

    // Generar ID único para el topic
    const topicId = 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    
    // Crear el nuevo topic
    const newTopic = {
      id: topicId,
      title: title.trim(),
      description: content.trim(),
      author: currentUser.username || 'Usuario',
      authorAvatar: (currentUser.username || 'U')[0].toUpperCase(),
      createdAt: Date.now(),
      category: category || 'general',
      upvotes: 0,
      downvotes: 0,
      replies: 0,
      views: 0,
      isPinned: false,
      isLocked: false
    };

    // Actualizar la lista de topics
    setTopics(prevTopics => [newTopic, ...prevTopics]);

    // Persistir en localStorage
    try {
      console.log('💾 ForumsSection: Saving new topic to storage');
      
      // Cargar topics existentes del localStorage
      const currentTopics = safeStorageGet(TOPICS_KEY, []);
      const updatedTopics = [newTopic, ...currentTopics];
      safeStorageSet(TOPICS_KEY, updatedTopics);
      
      // Cargar postsMap existente y agregar topic vacío
      const currentPostsMap = safeStorageGet(POSTS_KEY, {});
      const updatedPostsMap = { ...currentPostsMap, [topicId]: [] };
      safeStorageSet(POSTS_KEY, updatedPostsMap);

      console.log('✅ ForumsSection: Topic saved successfully');

      // Cerrar modal y notificar
      setShowCreateModal(false);
      
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Topic creado',
          message: `"${title}" ha sido creado exitosamente`
        });
      }

      // Navegar al nuevo topic
      console.log('🧭 ForumsSection: Navigating to topic:', topicId);
      navigate(`/topic/${topicId}`);

    } catch (error) {
      console.error('❌ ForumsSection: Error al crear topic:', error);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudo crear el topic. Inténtalo nuevamente.'
        });
      }
    }
  }, [getCurrentUser, onNotify, navigate, setTopics]);

  const handleVote = useCallback((topicId, voteType) => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      // Solo mostrar notificación si onNotify está disponible
      if (onNotify && typeof onNotify === 'function') {
        onNotify({
          type: 'warning',
          title: 'Acceso requerido',
          message: 'Debes iniciar sesión para votar'
        });
      }
      return;
    }

    // Prevenir múltiples votaciones simultáneas para el mismo topic
    if (votingInProgress.has(topicId)) {
      return;
    }

    // Debounce: Prevenir votos muy rápidos (menos de 500ms entre votos del mismo usuario en el mismo topic)
    const voteKey = `${currentUser.id}_${topicId}`;
    const now = Date.now();
    const lastTime = lastVoteTime[voteKey] || 0;
    
    if (now - lastTime < 500) {
      return;
    }
    
    // Actualizar timestamp del último voto
    setLastVoteTime(prev => ({
      ...prev,
      [voteKey]: now
    }));

    // Marcar votación en progreso
    setVotingInProgress(prev => new Set([...prev, topicId]));

    try {
      // Usar la función centralizada para manejar el voto
      const result = handleTopicVote(topicId, voteType, currentUser);
      
      // Actualizar el estado local con los topics actualizados
      setTopics(result.updatedTopics);

      // Notificar resultado
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Votación actualizada',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error al guardar voto:', error);
      
      // Manejar errores específicos
      let errorMessage = 'No se pudo registrar el voto. Inténtalo nuevamente.';
      let errorTitle = 'Error';
      
      if (error.message.includes('Usuario bloqueado')) {
        errorTitle = 'Cuenta suspendida';
        errorMessage = 'Tu cuenta ha sido suspendida y no puedes votar';
      } else if (error.message.includes('Sin permisos')) {
        errorTitle = 'Sin permisos';
        errorMessage = 'No tienes permisos para votar';
      } else if (error.message === 'VOTE_WOULD_BE_NEGATIVE') {
        errorTitle = 'Voto no permitido';
        errorMessage = 'No puedes votar negativo cuando el score sería menor que 0';
      }
      
      if (onNotify) {
        onNotify({
          type: 'error',
          title: errorTitle,
          message: errorMessage
        });
      }
    } finally {
      // Limpiar el estado de votación en progreso
      setVotingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(topicId);
        return newSet;
      });
    }
  }, [getCurrentUser, onNotify, votingInProgress, lastVoteTime]);



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
    
    try {
      await shareTopicUrl(topic, onNotify);
    } catch (err) {
      console.error('Error sharing topic:', err);
      onNotify && onNotify({ 
        type: 'error', 
        title: 'Error', 
        message: 'No se pudo compartir el topic' 
      });
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
            
            // Verificar si el usuario está bloqueado
            if (isUserBlocked(currentUser.username)) {
              if (onNotify) onNotify({
                type: 'error',
                title: 'Cuenta suspendida',
                message: 'Tu cuenta ha sido suspendida y no puedes crear contenido'
              });
              return;
            }
            
            setShowCreateModal(true);
          }}>
            <i className="fas fa-plus me-2" aria-hidden="true"></i> Crear Topic
          </button>
        </div>

        {/* Lista de topics estilo Reddit */}
        <div className="topics-list">
          {topics.length === 0 ? (
            <div className="empty-state text-center py-5">
              <i className="fas fa-comments fa-4x text-muted mb-3"></i>
              <h4 className="text-muted">No hay topics todavía</h4>
              <p className="text-muted mb-4">Sé el primero en iniciar una conversación en la comunidad</p>
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
                
                // Verificar si el usuario está bloqueado
                if (isUserBlocked(currentUser.username)) {
                  if (onNotify) onNotify({
                    type: 'error',
                    title: 'Cuenta suspendida',
                    message: 'Tu cuenta ha sido suspendida y no puedes crear contenido'
                  });
                  return;
                }
                
                setShowCreateModal(true);
              }}>
                <i className="fas fa-plus me-2"></i> Crear primer topic
              </button>
            </div>
          ) : topics.map(topic => {
            const score = (topic.upvotes || 0) - (topic.downvotes || 0);
            return (
              <div 
                key={topic.id} 
                className="topic-card-reddit"
                onClick={() => navigate(`/topic/${topic.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/topic/${topic.id}`); }}
              >
                {/* Voting sidebar */}
                <div className="vote-sidebar">
                  {(() => {
                    const userVote = getUserVoteStatus(topic.id);
                    const isVoting = votingInProgress.has(topic.id);
                    return (
                      <>
                        <button 
                          className={`vote-btn upvote ${userVote === 'up' ? 'active' : ''} ${isVoting ? 'voting' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isVoting && validateVoteAttempt(topic.id, 'up')) {
                              handleVote(topic.id, 'up');
                            }
                          }}
                          disabled={isVoting}
                          aria-label="Upvote"
                          title={isVoting ? "Procesando voto..." : userVote === 'up' ? "Remover voto positivo" : "Votar positivo"}
                        >
                          <i className={`fas ${isVoting ? 'fa-spinner fa-spin' : 'fa-arrow-up'}`}></i>
                        </button>
                        <span className="vote-score" aria-live="polite">{score}</span>
                        <button 
                          className={`vote-btn downvote ${userVote === 'down' ? 'active' : ''} ${isVoting ? 'voting' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isVoting && validateVoteAttempt(topic.id, 'down')) {
                              handleVote(topic.id, 'down');
                            }
                          }}
                          disabled={isVoting}
                          aria-label="Downvote"
                          title={isVoting ? "Procesando voto..." : userVote === 'down' ? "Remover voto negativo" : "Votar negativo"}
                        >
                          <i className={`fas ${isVoting ? 'fa-spinner fa-spin' : 'fa-arrow-down'}`}></i>
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
                        navigate(`/topic/${topic.id}`); 
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
      
      {/* Modal para crear nuevo topic */}
      <CreateTopicModal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreateTopic={handleCreateTopic} 
        onNotify={onNotify} 
      />
    </section>
  );
};

export default ForumsSection;