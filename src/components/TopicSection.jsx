import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostModal from './modals/PostModal';
import CreateTopicModal from './modals/CreateTopicModal';
import PostThreadModal from './modals/PostThreadModal';
import NewPostModal from './modals/NewPostModal';
import DeleteTopicModal from './modals/DeleteTopicModal';
import ReportUserModal from './modals/ReportUserModal';
import { isUserBlocked, checkUserPermission, isAdmin } from '../utils/roleUtils';
import { shareTopicUrl, sharePostUrl } from '../utils/shareUtils';
import { TopicsAPI, PostsAPI } from '../services/api';
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

const TopicSection = ({ onNotify, user }) => {
  const navigate = useNavigate();
  const { topicId: currentTopicId } = useParams();
  
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

  const [currentTopic, setCurrentTopic] = useState(null);
  const [apiPosts, setApiPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mantener compatibilidad con localStorage para otras funciones
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

  // Cargar topic específico desde la API
  useEffect(() => {
    const loadTopic = async () => {
      if (!currentTopicId) {
        setError('No se especificó un topic');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Loading topic from API:', currentTopicId);
        const topic = await TopicsAPI.getById(currentTopicId);
        console.log('✅ Topic loaded successfully:', topic);
        setCurrentTopic(topic);

        // Cargar posts con respuestas usando el nuevo endpoint
        const postsWithReplies = await PostsAPI.getAllWithReplies({ topic_id: currentTopicId });
        console.log('📝 Posts with replies loaded:', postsWithReplies);
        setApiPosts(postsWithReplies || []);

      } catch (error) {
        console.error('❌ Error loading topic:', error);
        setError(error.message || 'Topic no encontrado');
        
        if (error.response?.status === 404) {
          if (onNotify) {
            onNotify({
              type: 'error',
              title: 'Topic no encontrado',
              message: 'El topic que buscas no existe o ha sido eliminado.'
            });
          }
        } else {
          if (onNotify) {
            onNotify({
              type: 'error',
              title: 'Error',
              message: 'No se pudo cargar el topic. Verifica tu conexión.'
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, [currentTopicId]); // Solo depender del topicId

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
  // Función para recargar datos completos
  const reloadTopicData = useCallback(async () => {
    if (!currentTopicId) return;

    try {
      console.log('🔄 Reloading topic data from API:', currentTopicId);
      
      const [topic, postsWithReplies] = await Promise.all([
        TopicsAPI.getById(currentTopicId),
        PostsAPI.getAllWithReplies({ topic_id: currentTopicId })
      ]);
      
      console.log('✅ Topic and posts reloaded successfully');
      setCurrentTopic(topic);
      setApiPosts(postsWithReplies || []);
      
      // También actualizar el post activo en el modal si está abierto
      if (activeThreadPost) {
        const updatedPost = postsWithReplies.find(p => p.id === activeThreadPost.id);
        if (updatedPost) {
          setActiveThreadPost(updatedPost);
        }
      }
    } catch (error) {
      console.error('❌ Error reloading topic data:', error);
    }
  }, [currentTopicId, activeThreadPost]);

  // Función para votar en topics
  const handleTopicVote = useCallback(async (voteType) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) {
        onNotify({
          type: 'warning',
          title: 'Acceso requerido',
          message: 'Debes iniciar sesión para votar'
        });
      }
      return;
    }

    if (!currentTopicId || !currentTopic) {
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No hay topic seleccionado'
        });
      }
      return;
    }

    try {
      console.log('🗳️ Voting on topic:', { topicId: currentTopicId, voteType, userId: currentUser.id });
      
      // Datos a enviar (asegurándonos de que sean del tipo correcto)
      const voteData = {
        user_id: parseInt(currentUser.id),
        vote_type: String(voteType)
      };
      
      console.log('📤 Sending vote data:', voteData);
      console.log('📤 Vote data stringified:', JSON.stringify(voteData));
      
      // Enviar voto usando la API
      const result = await TopicsAPI.vote(currentTopicId, voteData);
      console.log('✅ Vote submitted successfully:', result);

      // Recargar el topic para mostrar los votos actualizados
      await reloadTopicData();

      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Voto registrado',
          message: `Has ${voteType === 'up' ? 'upvoteado' : 'downvoteado'} este topic`
        });
      }

    } catch (error) {
      console.error('❌ Error voting on topic:', error);
      console.error('❌ Full error:', error.response?.data || error.message);
      console.error('❌ Error status:', error.response?.status);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudo registrar el voto. Inténtalo de nuevo.'
        });
      }
    }
  }, [currentTopicId, currentTopic, reloadTopicData, onNotify]);

  const forceUpdate = useCallback(async () => {
    await reloadTopicData();
    setUpdateTrigger(prev => prev + 1);
  }, [reloadTopicData]);

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

  // Función para eliminar el topic actual - debe estar antes de los useEffect
  const handleDeleteTopic = useCallback(async () => {
    if (!currentTopicId || !currentTopic) {
      throw new Error('No hay topic para eliminar');
    }

    try {
      console.log('🗑️ Deleting topic via API:', currentTopicId);
      
      // Eliminar topic usando la API
      await TopicsAPI.delete(currentTopicId);
      console.log('✅ Topic deleted successfully');

      // Redirigir a foros después de eliminar
      navigate('/forums');

      return 'Topic eliminado exitosamente';
    } catch (error) {
      console.error('❌ Error deleting topic:', error);
      throw new Error(`No se pudo eliminar el topic: ${error.message}`);
    }
  }, [currentTopicId, currentTopic, navigate]);

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
    
    // Usar apiPosts (datos de la API) en lugar de postsMap (localStorage)
    if (!Array.isArray(apiPosts)) return [];
    
    // Filtrar posts de la API si es necesario (por usuarios bloqueados, etc.)
    return apiPosts.filter(post => {
      // Si el post es de usuario bloqueado, ocultarlo (excepto para admins)
      if (post.author_username && isUserBlocked(post.author_username) && (!currentUser || !isAdmin(currentUser))) {
        return false;
      }
      
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTopicId, user, apiPosts]); // Usar apiPosts en lugar de postsMap

  // Validación de props críticas después de todos los hooks
  if (!currentTopicId) {
    console.error('TopicSection: currentTopicId is required');
    navigate('/forums');
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
    if (currentUser.username === post.author_username) {
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
      username: post.author_username,
      postId: post.id,
      topicId: currentTopicId
    });
    setShowReportModal(true);
  };

  const handleCreateTopic = async ({ title, description, message }) => {
    console.log('🔧 Creating topic:', { title, description, message });
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'Debes iniciar sesión para crear un topic.' });
      return;
    }
    
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
    
    try {
      // Crear topic usando la API
      const topicData = {
        title: title.trim(),
        description: description.trim(),
        author_id: currentUser.id,
        category_id: 1 // Por defecto "General"
      };

      console.log('🔄 Creating topic via API:', topicData);
      const newTopic = await TopicsAPI.create(topicData);
      console.log('✅ Topic created successfully:', newTopic);

      // Crear post inicial en el topic si hay mensaje
      if (message && message.trim()) {
        const postData = {
          topic_id: newTopic.id,
          title: 'Post inicial',
          content: message.trim(),
          author_id: currentUser.id
        };

        console.log('🔄 Creating initial post via API:', postData);
        const newPost = await PostsAPI.create(postData);
        console.log('✅ Initial post created successfully:', newPost);
      }

      setShowCreateModal(false);
      if (onNotify) onNotify({ type: 'success', title: 'Topic creado', message: title });
      
      console.log('🔄 Navigating to topic:', `topic:${newTopic.id}`);
      navigate(`/topic/${newTopic.id}`);

    } catch (error) {
      console.error('❌ Error creating topic:', error);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudo crear el topic. Inténtalo de nuevo.'
        });
      }
    }
  };

  const handleReplySubmit = async ({ message }) => {
    if (!currentTopicId) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'No hay topic seleccionado.' });
      return;
    }

    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'Debes iniciar sesión para responder.' });
      return;
    }
    
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

    try {
      if (replyTo) {
        // Crear respuesta usando el endpoint específico
        const replyData = {
          author_id: currentUser.id,
          content: message.trim(),
          title: `Re: ${currentTopic?.title || 'Respuesta'}`
        };

        console.log('🔄 Creating reply via API:', replyData);
        const newReply = await PostsAPI.createReply(replyTo, replyData);
        console.log('✅ Reply created successfully:', newReply);
        
        // Recargar datos completos automáticamente
        await reloadTopicData();
      } else {
        // Crear post nuevo (respuesta rápida)
        const postData = {
          topic_id: parseInt(currentTopicId),
          title: 'Respuesta rápida',
          content: message.trim(),
          author_id: currentUser.id
        };

        console.log('🔄 Creating quick post via API:', postData);
        const newPost = await PostsAPI.create(postData);
        console.log('✅ Quick post created successfully:', newPost);
        
        // Recargar datos completos automáticamente
        await reloadTopicData();
      }

      setShowReplyModal(false);
      setReplyTo(null);
      
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Respuesta enviada',
          message: 'Tu respuesta se ha enviado exitosamente'
        });
      }

    } catch (error) {
      console.error('❌ Error creating reply:', error);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudo enviar la respuesta. Inténtalo de nuevo.'
        });
      }
    }
  };

  const handleNewPostSubmit = async ({ title, description, message }) => {
    if (!currentTopicId) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'No hay topic seleccionado.' });
      setShowNewPostModal(false);
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: 'Debes iniciar sesión para crear un post.' });
      setShowNewPostModal(false);
      return;
    }

    try {
      // Crear post usando la API
      const postData = {
        topic_id: parseInt(currentTopicId),
        title: title.trim(),
        content: message.trim(),
        author_id: currentUser.id
      };

      console.log('🔄 Creating post via API:', postData);
      const newPost = await PostsAPI.create(postData);
      console.log('✅ Post created successfully:', newPost);

      // Recargar datos completos automáticamente
      await reloadTopicData();

      setShowNewPostModal(false);
      
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Post creado',
          message: 'Tu post se ha creado exitosamente'
        });
      }

    } catch (error) {
      console.error('❌ Error creating post:', error);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudo crear el post. Inténtalo de nuevo.'
        });
      }
    }
    
    // Forzar actualización de la vista
    forceUpdate();
    
    if (onNotify) onNotify({ type: 'success', title: 'Publicación creada', message: 'Tu publicación fue añadida.' });
  };

  const handleShare = async (e, post) => {
    e.stopPropagation();
    try {
      await sharePostUrl(post, currentTopicId, onNotify);
    } catch (err) {
      console.error('Error sharing post:', err);
      onNotify && onNotify({ type: 'error', title: 'Error', message: 'No se pudo compartir' });
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
              
              <button className="btn btn-secondary" onClick={() => navigate('/forums')}>Volver a categorías</button>
            </div>
          </div>

          <div>
            {topics.map(t => (
              <div key={t.id} className="forum-category p-3 mb-2" style={{cursor:'pointer'}} onClick={() => navigate(`/topic/${t.id}`)}>
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
  if (!currentTopic && currentTopicId) {
    return (
      <section className="topic-section">
        <div className="container">
          <div className="topic-header card-custom">
            <div className="topic-header-content">
              <div className="topic-header-left">
                <button 
                  className="btn-back" 
                  onClick={() => navigate('/forums')}
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
                    onClick={() => navigate('/forums')}
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

  // Estados de loading y error
  if (loading) {
    return (
      <section className="topic-section">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando topic...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="topic-section">
        <div className="container">
          <div className="alert alert-danger text-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <br />
            <button className="btn btn-primary mt-2" onClick={() => navigate('/forums')}>
              Volver a los foros
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && !error && !currentTopic) {
    return (
      <section className="topic-section">
        <div className="container">
          <div className="alert alert-warning text-center">
            <i className="fas fa-search me-2"></i>
            Topic no encontrado
            <br />
            <button className="btn btn-primary mt-2" onClick={() => navigate('/forums')}>
              Volver a los foros
            </button>
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
                onClick={() => navigate('/forums')}
                aria-label="Volver"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="topic-info">
                <span className="topic-category">{currentTopic?.category || 'General'}</span>
                <h2 className="topic-title">{currentTopic?.title || 'Tema'}</h2>
                <p className="topic-description">{currentTopic?.description || 'Descripción no disponible.'}</p>
                <div className="topic-meta">
                  <span className="topic-author">
                    <span className="author-avatar">{(currentTopic?.author_username || 'A')[0]}</span>
                    u/{currentTopic?.author_username || 'Anon'}
                  </span>
                  <div className="topic-voting">
                    <button 
                      className="vote-btn upvote-btn"
                      onClick={() => handleTopicVote('up')}
                      title="Upvote este topic"
                    >
                      <i className="fas fa-arrow-up"></i>
                    </button>
                    <span className="vote-count">{(currentTopic?.upvotes || 0) - (currentTopic?.downvotes || 0)}</span>
                    <button 
                      className="vote-btn downvote-btn"
                      onClick={() => handleTopicVote('down')}
                      title="Downvote este topic"
                    >
                      <i className="fas fa-arrow-down"></i>
                    </button>
                  </div>
                  <span className="topic-stats">
                    <i className="fas fa-comment"></i> {apiPosts.length} posts
                  </span>
                </div>
              </div>
            </div>
            <div className="topic-header-actions">
              <button className="btn btn-primary" onClick={openNewPost}>
                <i className="fas fa-plus"></i> Nuevo Post
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={async () => {
                  console.log('🔗 Sharing topic:', currentTopic);
                  console.log('🔗 Current topic ID:', currentTopicId);
                  try {
                    if (!currentTopic || !currentTopic.id) {
                      throw new Error('Topic no encontrado o sin ID');
                    }
                    await shareTopicUrl(currentTopic, onNotify);
                  } catch (err) {
                    console.error('Error sharing topic:', err);
                    onNotify && onNotify({ type: 'error', title: 'Error', message: 'No se pudo compartir: ' + err.message });
                  }
                }}
              >
                <i className="fas fa-share-alt"></i> Compartir Topic
              </button>
              
              {/* Botón de eliminar topic - visible para el autor o administradores */}
              {(() => {
                const currentUser = getCurrentUser();
                const isAuthor = currentUser && currentTopic && currentTopic.author_username === currentUser.username;
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
          <div className="empty-state">
            <i className="fas fa-comments empty-icon"></i>
            <h4>No hay posts todavía</h4>
            <p>Sé el primero en compartir tu opinión</p>
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
                    <span className="author-avatar">{post.authorAvatar || post.author_username?.[0]?.toUpperCase() || 'U'}</span>
                    <div className="author-details">
                      <span className="author-name">u/{post.author_username}</span>
                      <span className="post-time">{timeAgo(new Date(post.created_at).getTime())}</span>
                    </div>
                  </div>
                </div>
                
                <div className="post-content">
                  {post.title && <h3 className="post-title">{post.title}</h3>}
                  <p className="post-message">{post.content}</p>
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
                      const canReport = currentUser && currentUser.username !== post.author_username;
                      
                      if (canReport) {
                        return (
                          <button 
                            className="action-btn report" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openReport(post);
                            }}
                            title={`Reportar a ${post.author_username}`}
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
        show={showThreadModal && !!activeThreadPost}
        onClose={() => { 
          syncPostsMapFromStorage(); // Sincronizar al cerrar el modal
          setShowThreadModal(false); 
          setActiveThreadPost(null); 
        }}
        post={activeThreadPost}
        onReplyAdded={forceUpdate}
        onPostUpdated={reloadTopicData} // Recargar datos cuando se actualicen likes/dislikes
        onNotify={onNotify}
      />
      
      {/* Modal de confirmación para eliminar topic */}
      <DeleteTopicModal 
        show={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onDeleteTopic={handleDeleteTopic} 
        topicTitle={currentTopic?.title || 'Topic'}
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