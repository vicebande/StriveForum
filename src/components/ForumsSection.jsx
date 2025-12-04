import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTopicModal from './modals/CreateTopicModal';
import { checkUserPermission, isUserBlocked } from '../utils/roleUtils';
import { shareTopicUrl } from '../utils/shareUtils';
import { TopicsAPI } from '../services/api';
import { getAuthSession } from '../utils/storage';

const ForumsSection = ({ onNotify }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('hot'); // hot, new, top
  const [votingInProgress, setVotingInProgress] = useState(new Set());
  const [lastVoteTime, setLastVoteTime] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar temas desde la API
  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const topics = await TopicsAPI.getAll({ sortBy, limit: 50 });
      console.log('📂 ForumsSection: Loaded topics from API:', topics);
      
      setTopics(topics || []);
    } catch (error) {
      console.error('❌ Error loading topics:', error);
      setError(error.message || 'Error al cargar los temas');
      
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar los temas. Verifica que el servidor esté funcionando.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [sortBy, onNotify]);

  // Cargar temas al montar el componente y cuando cambie el filtro
  useEffect(() => {
    console.log('🔄 ForumsSection: Component mounted or sortBy changed');
    loadTopics();
  }, [loadTopics]);

  const handleSort = (type) => {
    setSortBy(type);
    
    if (onNotify) onNotify({ 
      type: 'success', 
      title: 'Ordenamiento actualizado', 
      message: `Ordenado por: ${type === 'hot' ? 'Populares' : type === 'new' ? 'Recientes' : 'Más votados'}` 
    });
  };

  const getCurrentUser = useCallback(() => {
    try {
      const auth = getAuthSession();
      return auth?.user || null;
    } catch {
      return null;
    }
  }, []);

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
    
    return true;
  }, [getCurrentUser, onNotify]);

  // Función para crear un nuevo topic usando la API
  const handleCreateTopic = useCallback(async ({ title, content, category }) => {
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

    try {
      // Crear el topic usando la API
      const topicData = {
        title: title.trim(),
        description: content.trim(),
        category: category || 'general',
        author_id: currentUser.id
      };

      const newTopic = await TopicsAPI.create(topicData);
      
      // Actualizar la lista local
      setTopics(prevTopics => [newTopic, ...prevTopics]);

      // Cerrar modal y mostrar notificación
      setShowCreateModal(false);
      
      if (onNotify) onNotify({
        type: 'success',
        title: 'Topic creado',
        message: `El topic "${title}" ha sido creado exitosamente`
      });

    } catch (error) {
      console.error('❌ Error creating topic:', error);
      
      if (onNotify) onNotify({
        type: 'error',
        title: 'Error al crear topic',
        message: error.message || 'No se pudo crear el topic'
      });
    }
  }, [getCurrentUser, onNotify, navigate, setTopics]);

  const handleVote = useCallback(async (topicId, voteType) => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
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
      // Datos para el voto
      const voteData = {
        user_id: parseInt(currentUser.id),
        vote_type: voteType
      };
      
      console.log('🗳️ ForumsSection voting:', { topicId, voteData });
      
      // Usar la API para votar
      await TopicsAPI.vote(topicId, voteData);
      
      // Recargar los topics para obtener los votos actualizados
      loadTopics();

      // Notificar resultado exitoso
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Voto registrado',
          message: `Tu ${voteType === 'up' ? 'voto positivo' : 'voto negativo'} ha sido registrado`
        });
      }

    } catch (error) {
      console.error('❌ Error voting:', error);
      
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error al votar',
          message: error.message || 'No se pudo registrar el voto'
        });
      }
    } finally {
      // Remover del progreso de votación
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

        {/* Loading state */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando temas...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Error de conexión
            </h4>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={loadTopics}>
              <i className="fas fa-redo me-2"></i>
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de topics estilo Reddit */}
        {!loading && !error && (
          <div className="topics-list">
            {topics.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-comments fa-4x"></i>
              <h4>No hay topics todavía</h4>
              <p>Sé el primero en iniciar una conversación en la comunidad</p>
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
                onClick={async () => {
                  try {
                    // Incrementar vistas usando la API
                    await TopicsAPI.incrementViews(topic.id);
                  } catch (error) {
                    console.error('Error incrementing views:', error);
                  }
                  navigate(`/topic/${topic.id}`);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={async (e) => { 
                  if (e.key === 'Enter') {
                    try {
                      await TopicsAPI.incrementViews(topic.id);
                    } catch (error) {
                      console.error('Error incrementing views:', error);
                    }
                    navigate(`/topic/${topic.id}`);
                  }
                }}
              >
                {/* Voting sidebar */}
                <div className="vote-sidebar">
                  {(() => {
                    const isVoting = votingInProgress.has(topic.id);
                    return (
                      <>
                        <button 
                          className={`vote-btn upvote ${isVoting ? 'voting' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isVoting && validateVoteAttempt(topic.id, 'up')) {
                              handleVote(topic.id, 'up');
                            }
                          }}
                          disabled={isVoting}
                          aria-label="Upvote"
                          title={isVoting ? "Procesando voto..." : "Votar positivo"}
                        >
                          <i className={`fas ${isVoting ? 'fa-spinner fa-spin' : 'fa-arrow-up'}`}></i>
                        </button>
                        <span className="vote-score" aria-live="polite">{score}</span>
                        <button 
                          className={`vote-btn downvote ${isVoting ? 'voting' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isVoting && validateVoteAttempt(topic.id, 'down')) {
                              handleVote(topic.id, 'down');
                            }
                          }}
                          disabled={isVoting}
                          aria-label="Downvote"
                          title={isVoting ? "Procesando voto..." : "Votar negativo"}
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
        )}
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