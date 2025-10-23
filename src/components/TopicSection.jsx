import { useMemo, useState, useEffect, useCallback } from 'react';
import PostModal from './modals/PostModal';
import CreateTopicModal from './modals/CreateTopicModal';
import PostThreadModal from './modals/PostThreadModal';
import NewPostModal from './modals/NewPostModal';
import DeleteTopicModal from './modals/DeleteTopicModal';
import ReportUserModal from './modals/ReportUserModal';
import { isUserBlocked, checkUserPermission, isAdmin } from '../utils/roleUtils';

const fakeTopics = [
  {
    id: 't1',
    title: 'Guías y combos',
    description: 'Mejores combos para principiantes y tutoriales paso a paso.',
    author: 'Admin',
    createdAt: Date.now() - 1000*60*60*24*10,
    category: 'Guías',
    upvotes: 142
  }
];

const fakePosts = {
  t1: [
    { 
      id: 'p1', 
      author: 'UserA', 
      authorAvatar: 'U',
      title: 'Mejores combos para Ky Kiske',
      message: '¿Alguien tiene un combo simple para Ky que sea efectivo en ranked? Necesito algo que no requiera timing perfecto.', 
      createdAt: Date.now()-1000*60*60*24*2, 
      replies: [
        { 
          id: 'r1', 
          author: 'FightingCoach', 
          authorAvatar: 'F', 
          content: 'Prueba este combo básico pero efectivo: LP → MP → 236P (Stun Edge). Es perfecto para beginners y funciona contra la mayoría de personajes.', 
          createdAt: Date.now()-1000*60*60*24,
          likes: 8
        },
        { 
          id: 'r2', 
          author: 'KyMain', 
          authorAvatar: 'K', 
          content: '¡Ese combo está bien! También puedes probar LP → 214K (Vapor Thrust) para más daño. Es un poco más difícil pero vale la pena aprenderlo.', 
          createdAt: Date.now()-1000*60*60*12,
          likes: 5
        },
        { 
          id: 'r3', 
          author: 'NewPlayer', 
          authorAvatar: 'N', 
          content: 'Gracias por los consejos! ¿Hay algún combo que funcione bien en counter hit?', 
          createdAt: Date.now()-1000*60*60*6,
          likes: 2,
          parentId: 'r1'
        }
      ] 
    },
    { 
      id: 'p2', 
      author: 'UserB', 
      authorAvatar: 'B',
      title: 'Dudas sobre starter combos',
      message: '¿Qué botones usar para starter combos con personajes rápidos? No logro conectar bien los links. Juego principalmente Chipp y I-No.', 
      createdAt: Date.now()-1000*60*60*24*5, 
      replies: [
        { 
          id: 'r10', 
          author: 'ChippMaster', 
          authorAvatar: 'C', 
          content: 'Para Chipp usa 2P como starter. Es su normal más rápido (5 frames) y linkea fácil a 2K → 214K. Con I-No prueba c.S → f.S → 236H.', 
          createdAt: Date.now()-1000*60*60*24*4,
          likes: 15
        },
        { 
          id: 'r11', 
          author: 'INoQueen', 
          authorAvatar: 'I', 
          content: 'El timing de I-No es más strict. Practica el link c.S → f.S en training mode hasta que salga consistente. Después añade el special.', 
          createdAt: Date.now()-1000*60*60*24*3,
          likes: 9
        }
      ]
    },
    { 
      id: 'p4', 
      author: 'FGCNewbie', 
      authorAvatar: 'F',
      title: '¿Mejores controladores para Guilty Gear?',
      message: 'Soy nuevo en fighting games. ¿Recomiendan pad o stick? ¿Qué marcas son buenas para empezar sin gastar mucho?', 
      createdAt: Date.now()-1000*60*60*18, 
      replies: [
        { 
          id: 'r12', 
          author: 'StickVeteran', 
          authorAvatar: 'S', 
          content: 'Para empezar, un pad está perfecto. El DualSense de PS5 o el Xbox controller son excelentes. Los sticks son caros y requieren práctica.', 
          createdAt: Date.now()-1000*60*60*16,
          likes: 22
        },
        { 
          id: 'r13', 
          author: 'BudgetFighter', 
          authorAvatar: 'B', 
          content: 'Si quieres probar stick, el Mayflash F300 es bueno y barato (~$60). Puedes upgradear las partes después si te gusta.', 
          createdAt: Date.now()-1000*60*60*12,
          likes: 18
        },
        { 
          id: 'r14', 
          author: 'HitBoxUser', 
          authorAvatar: 'H', 
          content: 'También considera el Hitbox si tienes experiencia con teclado. Es muy preciso para charge characters y motion inputs.', 
          createdAt: Date.now()-1000*60*60*8,
          likes: 11
        }
      ]
    }
  ],
  t2: [
    { 
      id: 'p3', 
      author: 'MatchHunter', 
      authorAvatar: 'M',
      title: 'Busco equipo para rankeds',
      message: 'Busco team para rankeds nocturnos. Nivel intermedio, juego entre 10pm-2am horario CST. Estoy en Gold rank y quiero subir a Platinum.', 
      createdAt: Date.now()-1000*60*60*6, 
      replies: [
        { 
          id: 'r7', 
          author: 'NightOwl', 
          authorAvatar: 'N', 
          content: '¡Perfecto! Yo también juego en esos horarios. Estoy en Gold III y main Sol Badguy. Mi Discord es NightOwl#1234', 
          createdAt: Date.now()-1000*60*60*4,
          likes: 6
        },
        { 
          id: 'r8', 
          author: 'PlatiMay', 
          authorAvatar: 'P', 
          content: 'Los puedo ayudar con estrategias. Llegué a Celestial la temporada pasada. Para subir a Platinum necesitan trabajar en neutral game.', 
          createdAt: Date.now()-1000*60*60*2,
          likes: 12
        },
        { 
          id: 'r9', 
          author: 'CSTeamLead', 
          authorAvatar: 'C', 
          content: 'Tengo un server de Discord para players de CST timezone. ¡Únanse! discord.gg/cst-fighters', 
          createdAt: Date.now()-1000*60*60*1,
          likes: 8
        }
      ]
    },
    { 
      id: 'p5', 
      author: 'TourneyOrganizer', 
      authorAvatar: 'T',
      title: 'Torneo local este sábado - ¡Únanse!',
      message: 'Organizamos un torneo local de Guilty Gear Strive este sábado 2pm. Entry fee $10, prizes al top 3. Lugar: GameCenter Plaza Norte.', 
      createdAt: Date.now()-1000*60*60*2, 
      replies: [
        { 
          id: 'r15', 
          author: 'CompetitivePlayer', 
          authorAvatar: 'C', 
          content: '¡Cuenta conmigo! ¿Hay stream? Me gusta ver los matches después para estudiar.', 
          createdAt: Date.now()-1000*60*60*1,
          likes: 4
        },
        { 
          id: 'r16', 
          author: 'LocalSceneSupporter', 
          authorAvatar: 'L', 
          content: 'Excelente iniciativa! La escena local necesita más eventos así. ¿Habrá bracket para beginners?', 
          createdAt: Date.now()-1000*60*45,
          likes: 7
        }
      ]
    }
  ]
};

const TOPICS_KEY = 'sf_topics';
const POSTS_KEY = 'sf_postsMap';
const ACTIVE_THREAD_KEY = 'sf_active_thread';

const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

const TopicSection = ({ currentTopicId, onNavigate, onNotify, user }) => {
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
    const raw = localStorage.getItem(TOPICS_KEY);
    return safeParse(raw, fakeTopics);
  });

  const [postsMap, setPostsMap] = useState(() => {
    const raw = localStorage.getItem(POSTS_KEY);
    return safeParse(raw, fakePosts);
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

  // Función para sincronizar postsMap con localStorage
  const syncPostsMapFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(POSTS_KEY);
      const storagePostsMap = safeParse(raw, fakePosts);
      
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
    setTopics(t => [newTopic, ...t]);
    setPostsMap(m => ({ 
      ...m, 
      [id]: [{ 
        id: 'p' + Date.now().toString(36), 
        author: user?.username || 'Anon',
        authorAvatar: (user?.username || 'A')[0].toUpperCase(),
        title: 'Primer post',
        message, 
        createdAt: Date.now(), 
        replies: [] 
      }] 
    }));
    setShowCreateModal(false);
    if (onNotify) onNotify({ type: 'success', title: 'Topic creado', message: title });
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
        show={showThreadModal}
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