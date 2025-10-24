import { useEffect, useState, useCallback, useMemo } from 'react';
import PostThreadModal from './PostThreadModal';
import ReportUserModal from './ReportUserModal';

const PostModal = ({ show, onClose, post: initialPost, onNotify, onReplyAdded }) => {
  const [post, setPost] = useState(initialPost || null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, popular
  const [showReplies, setShowReplies] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReply, setReportingReply] = useState(null);

  const getCurrentUser = useCallback(() => {
    try {
      const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
      return session.user || null;
    } catch {
      return null;
    }
  }, []);

  const loadRepliesFromStorage = useCallback((postId) => {
    try {
      const postsData = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
      const allPosts = Object.values(postsData).flat();
      const foundPost = allPosts.find(p => p.id === postId);
      
      if (foundPost && foundPost.replies) {
        setPost(prev => prev ? { ...prev, replies: foundPost.replies } : prev);
      }
    } catch (err) {
      console.error('Error loading replies:', err);
    }
  }, []);

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      // Cargar replies desde localStorage si existen
      loadRepliesFromStorage(initialPost.id);
    } else {
      setPost(null);
    }
  }, [initialPost, loadRepliesFromStorage]);

  const persistReply = useCallback((postId, replyObj) => {
    try {
      const postsData = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
      const updated = { ...postsData };
      
      // Buscar en todas las categorías
      Object.keys(updated).forEach(categoryId => {
        const postIndex = updated[categoryId].findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          updated[categoryId][postIndex].replies = updated[categoryId][postIndex].replies || [];
          updated[categoryId][postIndex].replies.push(replyObj);
        }
      });
      
      localStorage.setItem('sf_postsMap', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving reply:', err);
    }
  }, []);

  const handleReply = useCallback((content) => {
    const user = getCurrentUser();
    if (!user) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para responder'
      });
      return;
    }
    
    const reply = {
      id: 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
      author: user.username,
      authorId: user.id,
      authorAvatar: user.username[0].toUpperCase(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      parentId: replyingTo ? replyingTo.id : null,
      depth: replyingTo ? (replyingTo.depth || 0) + 1 : 0
    };

    // Actualizar estado local
    setPost(prev => {
      if (!prev) return prev;
      const updatedReplies = [...(prev.replies || []), reply];
      return { ...prev, replies: updatedReplies };
    });

    // Persistir
    persistReply(post.id, reply);
    setShowReplyModal(false);
    setReplyingTo(null);

    // Notificar al componente padre que se agregó una respuesta
    if (onReplyAdded && typeof onReplyAdded === 'function') {
      onReplyAdded();
    }

    if (onNotify) {
      onNotify({
        type: 'success',
        title: 'Respuesta publicada',
        message: 'Tu respuesta se ha añadido correctamente'
      });
    }
  }, [getCurrentUser, persistReply, post, replyingTo, onNotify, onReplyAdded]);

  const handleReplyToReply = useCallback((reply) => {
    setReplyingTo(reply);
    setShowReplyModal(true);
  }, []);

  const handleReportReply = useCallback((reply) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para reportar contenido'
      });
      return;
    }
    
    setReportingReply(reply);
    setShowReportModal(true);
  }, [getCurrentUser, onNotify]);

  const handleLikeReply = useCallback((replyId) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        if (onNotify) {
          onNotify({
            type: 'warning',
            title: 'Acceso requerido',
            message: 'Debes iniciar sesión para dar like'
          });
        }
        return;
      }

      // Obtener likes actuales del usuario
      const userLikes = JSON.parse(localStorage.getItem('sf_user_likes') || '{}');
      const likeKey = `${currentUser.id}_${replyId}`;
      
      // Obtener posts para actualizar
      const postsData = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
      let replyFound = false;

      // Buscar y actualizar la reply en todas las categorías
      Object.keys(postsData).forEach(categoryId => {
        postsData[categoryId].forEach((post, postIndex) => {
          if (post.replies) {
            const replyIndex = post.replies.findIndex(r => r.id === replyId);
            if (replyIndex !== -1) {
              replyFound = true;
              const reply = postsData[categoryId][postIndex].replies[replyIndex];
              
              if (userLikes[likeKey]) {
                // Remover like
                delete userLikes[likeKey];
                reply.likes = Math.max(0, (reply.likes || 0) - 1);
              } else {
                // Agregar like
                userLikes[likeKey] = true;
                reply.likes = (reply.likes || 0) + 1;
              }
              
              postsData[categoryId][postIndex].replies[replyIndex] = reply;
            }
          }
        });
      });

      if (replyFound) {
        // Guardar cambios
        localStorage.setItem('sf_postsMap', JSON.stringify(postsData));
        localStorage.setItem('sf_user_likes', JSON.stringify(userLikes));
        
        // Actualizar estado local
        setPost(prev => {
          if (!prev || !prev.replies) return prev;
          return {
            ...prev,
            replies: prev.replies.map(reply => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  likes: userLikes[likeKey] ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 0) - 1)
                };
              }
              return reply;
            })
          };
        });

        if (onNotify) {
          const action = userLikes[likeKey] ? 'agregado' : 'removido';
          onNotify({
            type: 'success',
            title: `Like ${action}`,
            message: `❤️ ${action === 'agregado' ? 'Te gusta esta respuesta' : 'Ya no te gusta esta respuesta'}`
          });
        }
      }
    } catch (err) {
      console.error('Error al dar like:', err);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudo registrar el like'
        });
      }
    }
  }, [getCurrentUser, onNotify]);

  // Funciones de utilidad
  const timeAgo = useCallback((dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    const days = Math.floor(diff / 86400);
    if (days < 30) return `hace ${days}d`;
    return new Date(dateString).toLocaleDateString();
  }, []);

  // Organizar replies con hilos anidados
  const organizedReplies = useMemo(() => {
    if (!post?.replies) return [];
    
    const replies = [...post.replies];
    
    // Ordenar según preferencia
    switch (sortBy) {
      case 'oldest':
        replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'popular':
        replies.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default: // newest
        replies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Organizar en hilos (principales y respuestas)
    const mainReplies = replies.filter(r => !r.parentId);
    const nestedReplies = replies.filter(r => r.parentId);
    
    // Añadir respuestas anidadas a sus padres
    return mainReplies.map(main => ({
      ...main,
      childReplies: nestedReplies.filter(nested => nested.parentId === main.id)
    }));
  }, [post, sortBy]); // Cambiar a post completo en lugar de post?.replies

  if (!show || !post) {
    if (show && !post) {
      console.warn('⚠️ PostModal: Intentando mostrar modal sin post válido', { show, post });
    }
    return null;
  }

  return (
    <div className="rf-modal-backdrop" onClick={onClose}>
      <div className="rf-modal post-modal enhanced-post-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header mejorado */}
        <div className="rf-modal-header enhanced-header">
          <div className="post-header-info">
            <div className="post-author-section">
              <div className="post-author-avatar">
                {(post.author || post.user?.username || 'A')[0].toUpperCase()}
              </div>
              <div className="post-author-details">
                <h5 className="post-title">{post.title || 'Publicación'}</h5>
                <div className="post-metadata">
                  <span className="author-name">por {post.author || post.user?.username || 'Anónimo'}</span>
                  <span className="post-time">{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="btn-close enhanced-close" aria-label="Cerrar" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="rf-modal-body enhanced-body">
          
          {/* Contenido del post principal mejorado */}
          <div className="main-post-content">
            <div className="post-message">
              {post.message || post.content || post.description}
            </div>
            
            <div className="post-stats">
              <div className="stat-item">
                <i className="fas fa-comments"></i>
                <span>{(post.replies || []).length} respuesta{(post.replies || []).length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Sección de respuestas mejorada */}
          <div className="replies-section">
            <div className="replies-header">
              <div className="replies-title-section">
                <h6 className="replies-title">
                  <i className="fas fa-comments"></i>
                  Respuestas ({organizedReplies.length})
                </h6>
                
                <button 
                  className="toggle-replies-btn"
                  onClick={() => setShowReplies(!showReplies)}
                  aria-label={showReplies ? 'Ocultar respuestas' : 'Mostrar respuestas'}
                >
                  <i className={`fas fa-chevron-${showReplies ? 'up' : 'down'}`}></i>
                </button>
              </div>
              
              {organizedReplies.length > 0 && (
                <div className="replies-controls enhanced-sort-controls">
                  <div className="sort-info-section">
                    <div className="sort-stats">
                      <i className="fas fa-comments"></i>
                      <span className="sort-count">
                        {organizedReplies.length} respuesta{organizedReplies.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="sort-label">
                      <i className="fas fa-sort"></i>
                      Ordenar por:
                    </div>
                  </div>
                  
                  <div className="sort-options-container">
                    <div className="sort-options">
                      <button
                        className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
                        onClick={() => setSortBy('newest')}
                        title="Mostrar respuestas más recientes primero"
                      >
                        <i className="fas fa-clock"></i>
                        <span>Recientes</span>
                      </button>
                      
                      <button
                        className={`sort-option ${sortBy === 'oldest' ? 'active' : ''}`}
                        onClick={() => setSortBy('oldest')}
                        title="Mostrar respuestas más antiguas primero"
                      >
                        <i className="fas fa-history"></i>
                        <span>Antiguos</span>
                      </button>
                      
                      <button
                        className={`sort-option ${sortBy === 'popular' ? 'active' : ''}`}
                        onClick={() => setSortBy('popular')}
                        title="Mostrar respuestas con más likes primero"
                      >
                        <i className="fas fa-heart"></i>
                        <span>Populares</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showReplies && (
              <div className="replies-list">
                {organizedReplies.length === 0 ? (
                  <div className="empty-replies">
                    <div className="empty-replies-icon">
                      <i className="fas fa-comment-slash"></i>
                    </div>
                    <div className="empty-replies-text">
                      <h6>No hay respuestas todavía</h6>
                      <p>Sé el primero en responder a esta publicación</p>
                    </div>
                  </div>
                ) : (
                  organizedReplies.map(reply => (
                    <ReplyComponent 
                      key={reply.id}
                      reply={reply}
                      onReplyTo={handleReplyToReply}
                      onLike={handleLikeReply}
                      onReportReply={handleReportReply}
                      timeAgo={timeAgo}
                      currentUser={getCurrentUser()}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rf-modal-footer enhanced-footer">
          <div className="footer-left">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
              Cerrar
            </button>
          </div>
          
          <div className="footer-right">
            <button 
              className="btn btn-primary reply-btn"
              onClick={() => {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                  if (onNotify) onNotify({
                    type: 'warning',
                    title: 'Acceso requerido',
                    message: 'Debes iniciar sesión para responder'
                  });
                  return;
                }
                setReplyingTo(null);
                setShowReplyModal(true);
              }}
            >
              <i className="fas fa-reply"></i>
              Responder
            </button>
          </div>
        </div>
      </div>

      <PostThreadModal
        show={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyingTo(null);
        }}
        onReply={handleReply}
        replyingTo={replyingTo || { 
          author: post?.author || post?.user?.username || 'Autor', 
          content: post?.message || post?.content || post?.description || 'Contenido no disponible',
          parentId: null
        }}
        onNotify={onNotify}
      />

      <ReportUserModal
        show={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportingReply(null);
        }}
        reportedUsername={reportingReply?.author}
        postId={reportingReply?.id}
        topicId={post?.id}
        reporterUser={getCurrentUser()}
        contentType="reply"
        replyContent={reportingReply?.content}
        onNotify={onNotify}
      />
    </div>
  );
};

// Componente para renderizar replies individuales con mejor diseño
const ReplyComponent = ({ reply, onReplyTo, onLike, onReportReply, timeAgo, currentUser }) => {
  const [showChildReplies, setShowChildReplies] = useState(true);
  
  const getUserLikeStatus = (replyId) => {
    try {
      const userLikes = JSON.parse(localStorage.getItem('sf_user_likes') || '{}');
      const likeKey = `${currentUser.id}_${replyId}`;
      return userLikes[likeKey] || false;
    } catch {
      return false;
    }
  };
  
  return (
    <div className="reply-item">
      <div className="reply-main">
        <div className="reply-avatar">
          {reply.authorAvatar || reply.author[0].toUpperCase()}
        </div>
        
        <div className="reply-content">
          <div className="reply-header">
            <div className="reply-author-info">
              <span className="reply-author">{reply.author}</span>
              <span className="reply-time">{timeAgo(reply.createdAt)}</span>
              {reply.parentId && (
                <span className="reply-indicator">
                  <i className="fas fa-reply"></i>
                  respuesta
                </span>
              )}
            </div>
          </div>
          
          <div className="reply-body reply-content">
            {reply.content}
          </div>
          
          <div className="reply-actions">
            <button 
              className={`like-button ${getUserLikeStatus(reply.id) ? 'liked active' : ''}`}
              onClick={() => onLike(reply.id)}
              title="Me gusta"
            >
              <i className="fas fa-heart"></i>
              <span>{reply.likes || 0}</span>
            </button>
            
            <button 
              className="reply-action-btn reply-btn"
              onClick={() => onReplyTo(reply)}
              title="Responder"
            >
              <i className="fas fa-reply"></i>
              Responder
            </button>

            {currentUser && currentUser.username !== reply.author && (
              <button 
                className="reply-action-btn report-btn"
                onClick={() => onReportReply && onReportReply(reply)}
                title="Reportar respuesta"
              >
                <i className="fas fa-flag"></i>
                Reportar
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Respuestas anidadas */}
      {reply.childReplies && reply.childReplies.length > 0 && (
        <div className="nested-replies">
          <button 
            className="toggle-nested-btn"
            onClick={() => setShowChildReplies(!showChildReplies)}
          >
            <i className={`fas fa-chevron-${showChildReplies ? 'up' : 'down'}`}></i>
            {showChildReplies ? 'Ocultar' : 'Mostrar'} {reply.childReplies.length} respuesta{reply.childReplies.length !== 1 ? 's' : ''}
          </button>
          
          {showChildReplies && (
            <div className="child-replies">
              {reply.childReplies.map(childReply => (
                <ReplyComponent 
                  key={childReply.id}
                  reply={childReply}
                  onReplyTo={onReplyTo}
                  onLike={onLike}
                  onReportReply={onReportReply}
                  timeAgo={timeAgo}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostModal;