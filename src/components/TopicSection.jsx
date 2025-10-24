import { useMemo, useState, useEffect, useCallback } from 'react';
import PostModal from './modals/PostModal';
import CreateTopicModal from './modals/CreateTopicModal';
import PostThreadModal from './modals/PostThreadModal';
import NewPostModal from './modals/NewPostModal';
import DeleteTopicModal from './modals/DeleteTopicModal';
import ReportUserModal from './modals/ReportUserModal';
import { isUserBlocked, checkUserPermission, isAdmin } from '../utils/roleUtils';
import { 
  TOPICS_KEY, 
  POSTS_KEY, 
  safeStorageGet, 
  safeStorageSet, 
  debugStorage,
  clearAllData,
  safeParse 
} from '../utils/storage';

const ACTIVE_THREAD_KEY = 'sf_active_thread';

const TopicSection = ({ currentTopicId, onNavigate, onNotify, user }) => {
  // Debug de localStorage al cargar el componente
  useEffect(() => {
    console.log('🔍 TopicSection mounted - debugging localStorage');
    debugStorage();
  }, []);

  // Todos los hooks deben ejecutarse antes de cualquier validación o return early
  const getCurrentUser = useCallback(() => {
    try {
      // Priorizar el user prop si está disponible
      if (user && user.id) {
        return user;
      }
      // Fallback a localStorage
      const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
      return session.user || null;
    } catch (error) {
      console.warn('Error getting current user:', error);
      return null;
    }
  }, [user]);

  // Helper para manejar notificaciones de forma segura
  const safeNotify = useCallback((notification) => {
    if (onNotify && typeof onNotify === 'function') {
      try {
        onNotify(notification);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }, [onNotify]);

  const [topics, setTopics] = useState(() => {
    return safeStorageGet(TOPICS_KEY, []);
  });

  const [postsMap, setPostsMap] = useState(() => {
    return safeStorageGet(POSTS_KEY, {});
  });

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [activeThreadPost, setActiveThreadPost] = useState(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Estado para forzar actualizaciones

  // Sincronizar topics desde localStorage al cargar y cuando haya cambios
  useEffect(() => {
    const syncTopicsFromStorage = () => {
      const storageTopics = safeStorageGet(TOPICS_KEY, []);
      console.log('🔄 Syncing topics from localStorage:', storageTopics);
      
      // Solo actualizar si hay cambios reales
      setTopics(prevTopics => {
        const currentDataStr = JSON.stringify(prevTopics);
        const storageDataStr = JSON.stringify(storageTopics);
        
        if (currentDataStr !== storageDataStr) {
          console.log('📝 Topics state updated from storage');
          return storageTopics;
        }
        return prevTopics;
      });
    };

    // Sincronizar al montar el componente
    syncTopicsFromStorage();

    // Agregar listener para cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === TOPICS_KEY) {
        console.log('🔔 localStorage change detected for topics');
        syncTopicsFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // No incluir topics para evitar loops

  // Función para sincronizar postsMap con localStorage
  const syncPostsMapFromStorage = useCallback(() => {
    try {
      const storagePostsMap = safeStorageGet(POSTS_KEY, {});
      
      // Solo actualizar si hay cambios reales
      const currentDataStr = JSON.stringify(postsMap);
      const storageDataStr = JSON.stringify(storagePostsMap);
      
      if (currentDataStr !== storageDataStr) {
        setPostsMap(storagePostsMap);
      }
    } catch (error) {
      console.warn('Error syncing postsMap from localStorage:', error);
    }
  }, [postsMap]);

  // Función para forzar actualización
  const forceUpdate = useCallback(() => {
    syncPostsMapFromStorage();
    setUpdateTrigger(prev => prev + 1);
  }, [syncPostsMapFromStorage]);

  // Actualizar activeThreadPost cuando postsMap cambie
  useEffect(() => {
    if (activeThreadPost && currentTopicId) {
      const currentPosts = postsMap[currentTopicId] || [];
      const updatedPost = currentPosts.find(p => p.id === activeThreadPost.id);
      if (updatedPost && JSON.stringify(updatedPost.replies) !== JSON.stringify(activeThreadPost.replies)) {
        setActiveThreadPost(updatedPost);
      }
    }
  }, [postsMap, currentTopicId, activeThreadPost]);

  const topic = useMemo(() => {
    if (!currentTopicId) return null;
    return topics.find(t => t.id === currentTopicId);
  }, [topics, currentTopicId]);

  // Función para eliminar el topic actual - debe estar antes de los useEffect
  const handleDeleteTopic = useCallback(async () => {
    if (!currentTopicId || !topic) {
      throw new Error('No hay topic para eliminar');
    }

    try {
      // Actualizar localStorage directamente de forma síncrona
      
      // 1. Eliminar topic de la lista de topics
      const currentTopics = JSON.parse(localStorage.getItem(TOPICS_KEY) || '[]');
      const filteredTopics = currentTopics.filter(t => t.id !== currentTopicId);
      localStorage.setItem(TOPICS_KEY, JSON.stringify(filteredTopics));

      // 2. Eliminar todos los posts asociados
      const currentPostsMap = JSON.parse(localStorage.getItem(POSTS_KEY) || '{}');
      const newPostsMap = { ...currentPostsMap };
      delete newPostsMap[currentTopicId];
      localStorage.setItem(POSTS_KEY, JSON.stringify(newPostsMap));

      // 3. Actualizar el estado local para reflejar los cambios inmediatamente
      setTopics(filteredTopics);
      setPostsMap(newPostsMap);

      // 4. Redirigir a foros después de eliminar
      if (onNavigate && typeof onNavigate === 'function') {
        onNavigate('forums');
      }

      return 'Topic eliminado exitosamente';
    } catch (error) {
      console.error('Error eliminando topic:', error);
      throw new Error(`No se pudo eliminar el topic: ${error.message}`);
    }
  }, [currentTopicId, topic, onNavigate]);

  useEffect(() => {
    try { localStorage.setItem(TOPICS_KEY, JSON.stringify(topics)); } catch { /* ignore */ }
  }, [topics]);

  useEffect(() => {
    try { localStorage.setItem(POSTS_KEY, JSON.stringify(postsMap)); } catch { /* ignore */ }
  }, [postsMap]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_THREAD_KEY);
      const saved = safeParse(raw, null);
      if (!saved) return;
      if (saved.topicId && saved.postId && saved.topicId === currentTopicId) {
        const posts = postsMap[saved.topicId] || [];
        const found = posts.find(p => p.id === saved.postId);
        if (found) {
          setActiveThreadPost(found);
          setShowThreadModal(true);
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopicId]);

  useEffect(() => {
    try {
      if (showThreadModal && activeThreadPost) {
        localStorage.setItem(ACTIVE_THREAD_KEY, JSON.stringify({ topicId: currentTopicId, postId: activeThreadPost.id }));
      } else {
        localStorage.removeItem(ACTIVE_THREAD_KEY);
      }
    } catch { /* ignore */ }
  }, [showThreadModal, activeThreadPost, currentTopicId]);

  // Listener para sincronizar cambios de localStorage desde otras ventanas/tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === POSTS_KEY) {
        syncPostsMapFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncPostsMapFromStorage]);

  // Obtener posts visibles (filtrar contenido de usuarios bloqueados) - ANTES de validaciones
  const posts = useMemo(() => {
    if (!currentTopicId) return [];
    const currentUser = user || (() => {
      try {
        const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
        return session.user || null;
      } catch {
        return null;
      }
    })();
    
    // Usar el estado actual de postsMap en lugar de localStorage
    const currentPosts = postsMap[currentTopicId] || [];
    
    if (!Array.isArray(currentPosts)) return [];
    
    // Filtrar posts principales y sus respuestas usando la misma lógica que getVisiblePosts
    return currentPosts.filter(post => {
      // Si el post es de usuario bloqueado, ocultarlo (excepto para admins)
      if (post.author && isUserBlocked(post.author) && (!currentUser || !isAdmin(currentUser))) {
        return false;
      }
      
      // Filtrar respuestas de usuarios bloqueados
      if (post.replies && Array.isArray(post.replies)) {
        post.replies = post.replies.filter(reply => {
          return !reply.author || !isUserBlocked(reply.author) || (currentUser && isAdmin(currentUser));
        });
      }
      
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopicId, user, postsMap, updateTrigger]); // updateTrigger usado intencionalmente para forzar actualizaciones

  // Validación de props críticas después de todos los hooks
  if (!currentTopicId) {
    console.error('TopicSection: currentTopicId is required');
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate('forums');
    }
    return null;
  }

  const timeAgo = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff/60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`;
    return `hace ${Math.floor(diff/86400)}d`;
  };

  const openCreateTopic = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para crear un topic'
      });
      return;
    }
    setShowCreateModal(true);
  };
  const openReply = (postId = null) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para responder'
      });
      return;
    }
    setReplyTo(postId);
    setShowReplyModal(true);
  };
  const openNewPost = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      safeNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para crear un post'
      });
      return;
    }

    // Verificar si el usuario está bloqueado
    if (isUserBlocked(currentUser.username)) {
      safeNotify({
        type: 'error',
        title: 'Cuenta suspendida',
        message: 'Tu cuenta ha sido suspendida y no puedes crear contenido'
      });
      return;
    }

    // Verificar permisos específicos
    if (!checkUserPermission(currentUser.username, 'CREATE_POST')) {
      safeNotify({
        type: 'error',
        title: 'Sin permisos',
        message: 'No tienes permisos para crear posts'
      });
      return;
    }
    
    setShowNewPostModal(true);
  };
  const openThread = (post) => {
    setActiveThreadPost(post);
    setShowThreadModal(true);
  };

  const openReport = (post) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      safeNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para reportar usuarios'
      });
      return;
    }

    // No se puede reportar a uno mismo
    if (currentUser.username === post.author) {
      safeNotify({
        type: 'warning',
        title: 'Acción no permitida',
        message: 'No puedes reportarte a ti mismo'
      });
      return;
    }

    // Verificar si el usuario está bloqueado
    if (isUserBlocked(currentUser.username)) {
      safeNotify({
        type: 'error',
        title: 'Acceso denegado',
        message: 'Tu cuenta está bloqueada y no puedes realizar esta acción'
      });
      return;
    }

    setReportTarget({
      username: post.author,
      postId: post.id,
      topicId: currentTopicId
    });
    setShowReportModal(true);
  };

  const handleCreateTopic = ({ title, description, message }) => {
    console.log('🔧 Creating topic:', { title, description, message });
    const currentUser = getCurrentUser();
    
    // Verificar si el usuario está bloqueado
    if (currentUser && isUserBlocked(currentUser.username)) {
      if (onNotify) onNotify({
        type: 'error',
        title: 'Cuenta suspendida',
        message: 'Tu cuenta ha sido suspendida y no puedes crear contenido'
      });
      return;
    }

    // Verificar permisos específicos
    if (currentUser && !checkUserPermission(currentUser.username, 'CREATE_TOPIC')) {
      if (onNotify) onNotify({
        type: 'error',
        title: 'Sin permisos',
        message: 'No tienes permisos para crear topics'
      });
      return;
    }
    
    const id = 't' + (Date.now().toString(36).slice(-6));
    const newTopic = { 
      id, 
      title, 
      description, 
      author: user?.username || 'Anon', 
      createdAt: Date.now(),
      category: 'General',
      upvotes: 0
    };

    const newPost = {
      id: 'p' + Date.now().toString(36), 
      author: user?.username || 'Anon',
      authorAvatar: (user?.username || 'A')[0].toUpperCase(),
      title: 'Primer post',
      message, 
      createdAt: Date.now(), 
      replies: [] 
    };

    console.log('📝 New topic created:', newTopic);
    console.log('📝 New post created:', newPost);

    // Actualizar estado local
    setTopics(t => {
      const updated = [newTopic, ...t];
      console.log('📂 Topics updated:', updated);
      return updated;
    });
    setPostsMap(m => {
      const updated = { ...m, [id]: [newPost] };
      console.log('📂 PostsMap updated:', updated);
      return updated;
    });

    // Persistir inmediatamente en localStorage
    try {
      const currentTopics = safeStorageGet(TOPICS_KEY, []);
      const updatedTopics = [newTopic, ...currentTopics];
      safeStorageSet(TOPICS_KEY, updatedTopics);

      const currentPostsMap = safeStorageGet(POSTS_KEY, {});
      const updatedPostsMap = { ...currentPostsMap, [id]: [newPost] };
      safeStorageSet(POSTS_KEY, updatedPostsMap);

      // Verificar que se guardó correctamente
      console.log('� Verification after save:');
      debugStorage();
    } catch (error) {
      console.error('❌ Error saving topic to localStorage:', error);
    }

    setShowCreateModal(false);
    if (onNotify) onNotify({ type: 'success', title: 'Topic creado', message: title });
    
    console.log('🔄 Navigating to topic:', `topic:${id}`);
    if (typeof onNavigate === 'function') onNavigate(`topic:${id}`);
  };

  const handleReplySubmit = ({ message }) => {
    if (!currentTopicId) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'No hay topic seleccionado.' });
      return;
    }

    const currentUser = getCurrentUser();
    
    // Verificar si el usuario está bloqueado
    if (currentUser && isUserBlocked(currentUser.username)) {
      if (onNotify) onNotify({
        type: 'error',
        title: 'Cuenta suspendida',
        message: 'Tu cuenta ha sido suspendida y no puedes crear contenido'
      });
      return;
    }

    // Verificar permisos específicos
    if (currentUser && !checkUserPermission(currentUser.username, 'CREATE_POST')) {
      if (onNotify) onNotify({
        type: 'error',
        title: 'Sin permisos',
        message: 'No tienes permisos para crear posts'
      });
      return;
    }

    const newReply = { 
      id: 'r' + Date.now().toString(36), 
      author: user?.username || 'Anon',
      authorAvatar: (user?.username || 'A')[0].toUpperCase(),
      message, 
      createdAt: Date.now() 
    };

    setPostsMap(prev => {
      const copy = { ...prev };
      if (replyTo) {
        copy[currentTopicId] = (copy[currentTopicId] || []).map(p => {
          if (p.id === replyTo) {
            return { ...p, replies: [...(p.replies || []), newReply] };
          }
          return p;
        });
      } else {
        const newPost = { 
          id: 'p' + Date.now().toString(36), 
          author: user?.username || 'Anon',
          authorAvatar: (user?.username || 'A')[0].toUpperCase(),
          title: '',
          message, 
          createdAt: Date.now(), 
          replies: [] 
        };
        copy[currentTopicId] = [newPost, ...(copy[currentTopicId] || [])];
      }
      
      // Actualizar localStorage inmediatamente para sincronización
      try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(copy));
      } catch (error) {
        console.warn('Error saving to localStorage:', error);
      }
      
      return copy;
    });

    if (showThreadModal && replyTo && activeThreadPost && activeThreadPost.id === replyTo) {
      setActiveThreadPost(prev => {
        if (!prev) return prev;
        return { ...prev, replies: [...(prev.replies || []), newReply] };
      });
    }

    setShowReplyModal(false);
    
    // Forzar actualización de la vista
    forceUpdate();
    
    if (onNotify) onNotify({ type: 'info', title: 'Publicación creada', message: 'Tu publicación fue añadida.' });
  };

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
        authorAvatar: (user?.username || 'A')[0].toUpperCase(),
        title,
        description,
        message,
        createdAt: Date.now(),
        replies: []
      };
      copy[currentTopicId] = [newPost, ...(copy[currentTopicId] || [])];
      
      // Actualizar localStorage inmediatamente para sincronización
      try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(copy));
      } catch (error) {
        console.warn('Error saving to localStorage:', error);
      }
      
      return copy;
    });
    setShowNewPostModal(false);
    
    // Forzar actualización de la vista
    forceUpdate();
    
    if (onNotify) onNotify({ type: 'success', title: 'Publicación creada', message: 'Tu publicación fue añadida.' });
  };

  const handleShare = async (e, post) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Post',
          text: post.message,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          onNotify && onNotify({ type: 'info', title: 'Compartir', message: 'No se pudo compartir' });
        }
      }
    } else {
      onNotify && onNotify({ type: 'info', title: 'Copiado', message: 'Link copiado al portapapeles' });
    }
  };

  // Vista de lista de topics
  if (!currentTopicId) {
    return (
      <section className="content-section" style={{paddingTop:90}}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2><i className="fas fa-comments"></i> Temas</h2>
            <div>
              <button className="btn btn-primary me-2" onClick={openCreateTopic}>Crear Topic</button>
              
              {/* Botones de debug - remover en producción */}
              <button 
                onClick={() => {
                  console.log('🔍 Debug Storage clicked');
                  debugStorage();
                  
                  // Debug adicional - revisar localStorage directamente
                  console.log('📱 Raw localStorage check:');
                  console.log('TOPICS_KEY content:', localStorage.getItem(TOPICS_KEY));
                  console.log('POSTS_KEY content:', localStorage.getItem(POSTS_KEY));
                  
                  // Debug adicional - revisar estado actual
                  console.log('📊 Current state:');
                  console.log('topics:', topics);
                  console.log('postsMap:', postsMap);
                  
                  // Debug adicional - revisar todas las claves de localStorage
                  console.log('🗂️ All localStorage keys:');
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    console.log(`  ${key}:`, localStorage.getItem(key));
                  }
                }} 
                className="btn btn-info me-2"
                style={{ fontSize: '12px' }}
              >
                Debug
              </button>
              
              <button 
                onClick={() => {
                  clearAllData();
                  setTopics([]);
                  setPostsMap({});
                  console.log('🧹 All data cleared');
                }} 
                className="btn btn-warning me-2"
                style={{ fontSize: '12px' }}
              >
                Limpiar
              </button>
              
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

        <CreateTopicModal show={showCreateModal} onClose={() => setShowCreateModal(false)} onCreateTopic={handleCreateTopic} onNotify={onNotify} />
      </section>
    );
  }

  // Vista dentro de un topic (mejorada)

  // Verificar si el topic existe
  if (!topic && currentTopicId) {
    return (
      <section className="topic-section">
        <div className="container">
          <div className="topic-header card-custom">
            <div className="topic-header-content">
              <div className="topic-header-left">
                <button 
                  className="btn-back" 
                  onClick={() => { if (typeof onNavigate === 'function') onNavigate('forums'); }}
                  aria-label="Volver"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div className="topic-info">
                  <h2 className="topic-title">Topic no encontrado</h2>
                  <p className="topic-description">
                    El topic que buscas no existe o ha sido eliminado.
                  </p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => { if (typeof onNavigate === 'function') onNavigate('forums'); }}
                  >
                    <i className="fas fa-arrow-left"></i> Volver a los foros
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="topic-section">
      <div className="container">
        {/* Header del topic mejorado */}
        <div className="topic-header card-custom">
          <div className="topic-header-content">
            <div className="topic-header-left">
              <button 
                className="btn-back" 
                onClick={() => { if (typeof onNavigate === 'function') onNavigate('forums'); }}
                aria-label="Volver"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="topic-info">
                <span className="topic-category">{topic?.category || 'General'}</span>
                <h2 className="topic-title">{topic?.title || 'Tema'}</h2>
                <p className="topic-description">{topic?.description || 'Descripción no disponible.'}</p>
                <div className="topic-meta">
                  <span className="topic-author">
                    <span className="author-avatar">{(topic?.author || 'A')[0]}</span>
                    u/{topic?.author || 'Anon'}
                  </span>
                  <span className="topic-stats">
                    <i className="fas fa-fire"></i> {topic?.upvotes || 0} upvotes
                  </span>
                  <span className="topic-stats">
                    <i className="fas fa-comment"></i> {posts.length} posts
                  </span>
                </div>
              </div>
            </div>
            <div className="topic-header-actions">
              <button className="btn btn-primary" onClick={openNewPost}>
                <i className="fas fa-plus"></i> Nuevo Post
              </button>
              
              {/* Botón de eliminar topic - visible para el autor o administradores */}
              {(() => {
                const currentUser = getCurrentUser();
                const isAuthor = currentUser && topic && topic.author === currentUser.username;
                const isUserAdmin = currentUser && currentUser.role === 'admin';
                
                if (isAuthor || isUserAdmin) {
                  return (
                    <button 
                      className="btn btn-danger ms-2" 
                      onClick={() => setShowDeleteModal(true)}
                      title={isUserAdmin && !isAuthor ? "Eliminar topic (Admin)" : "Eliminar topic"}
                      aria-label="Eliminar topic"
                    >
                      <i className="fas fa-trash"></i> {isUserAdmin && !isAuthor ? "Eliminar (Admin)" : "Eliminar"}
                    </button>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>

        {/* Lista de posts mejorada */}
        {posts.length === 0 ? (
          <div className="empty-state card-custom">
            <i className="fas fa-comments empty-icon"></i>
            <h4>No hay posts todavía</h4>
            <p className="text-muted">Sé el primero en compartir tu opinión</p>
            <button className="btn btn-primary" onClick={openNewPost}>
              <i className="fas fa-plus"></i> Crear primer post
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card card-custom" onClick={() => openThread(post)}>
                <div className="post-header">
                  <div className="post-author-info">
                    <span className="author-avatar">{post.authorAvatar || post.author[0]}</span>
                    <div className="author-details">
                      <span className="author-name">u/{post.author}</span>
                      <span className="post-time">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="post-content">
                  {post.title && <h3 className="post-title">{post.title}</h3>}
                  <p className="post-message">{post.message}</p>
                </div>

                <div className="post-footer">
                  <div className="post-stats">
                    <span className="stat-item">
                      <i className="fas fa-comment"></i>
                      {post.replies?.length || 0} respuestas
                    </span>
                  </div>
                  <div className="post-actions">
                    <button 
                      className="action-btn reply" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openReply(post.id);
                      }}
                    >
                      <i className="fas fa-reply"></i> Responder
                    </button>
                    <button 
                      className="action-btn share" 
                      onClick={(e) => handleShare(e, post)}
                    >
                      <i className="fas fa-share-alt"></i> Compartir
                    </button>
                    {(() => {
                      const currentUser = getCurrentUser();
                      const canReport = currentUser && currentUser.username !== post.author;
                      
                      if (canReport) {
                        return (
                          <button 
                            className="action-btn report" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openReport(post);
                            }}
                            title={`Reportar a ${post.author}`}
                          >
                            <i className="fas fa-flag"></i> Reportar
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB para crear post */}
      <button className="fab-post" title="Nuevo post" onClick={openNewPost} aria-label="Nuevo post">
        <i className="fas fa-plus" />
      </button>

      {/* Modales */}
      <PostThreadModal 
        show={showReplyModal} 
        onClose={() => setShowReplyModal(false)} 
        onReply={(content) => handleReplySubmit({ message: content })} 
        replyingTo={replyTo ? posts.find(p => p.id === replyTo) || { 
          author: 'Usuario', 
          content: 'Post no encontrado', 
          parentId: null 
        } : null}
        onNotify={onNotify} 
      />
      <NewPostModal 
        show={showNewPostModal} 
        onClose={() => setShowNewPostModal(false)} 
        onSubmit={handleNewPostSubmit} 
        onNotify={onNotify} 
      />
      <CreateTopicModal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreateTopic={handleCreateTopic} 
        onNotify={onNotify} 
      />
      <PostModal
        show={showThreadModal && activeThreadPost !== null}
        onClose={() => { 
          syncPostsMapFromStorage(); // Sincronizar al cerrar el modal
          setShowThreadModal(false); 
          setActiveThreadPost(null); 
        }}
        post={activeThreadPost}
        onReplyAdded={forceUpdate}
        onNotify={onNotify}
      />
      
      {/* Modal de confirmación para eliminar topic */}
      <DeleteTopicModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onDeleteTopic={handleDeleteTopic} 
        topicTitle={topic?.title || 'Topic'}
        onNotify={onNotify} 
      />
      
      {/* Modal para reportar usuario */}
      <ReportUserModal
        show={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportTarget(null);
        }}
        reportedUsername={reportTarget?.username}
        postId={reportTarget?.postId}
        topicId={reportTarget?.topicId}
        reporterUser={getCurrentUser()}
        onNotify={safeNotify}
      />
    </section>
  );
};

export default TopicSection;