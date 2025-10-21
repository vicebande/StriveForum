import { useState, useEffect, useRef, useCallback } from 'react';

const PostThreadModal = ({ show, onClose, onReply, replyingTo, onNotify }) => {
  const getCurrentUser = useCallback(() => {
    try {
      const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
      return session.user || null;
    } catch {
      return null;
    }
  }, []);
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (show) {
      setContent('');
      setErrors({});
      setIsSubmitting(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [show]);

  const validate = () => {
    const e = {};
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      e.content = 'El contenido de la respuesta es obligatorio.';
    } else if (trimmedContent.length < 3) {
      e.content = 'La respuesta debe tener al menos 3 caracteres.';
    } else if (trimmedContent.length > 2000) {
      e.content = 'La respuesta no puede exceder los 2000 caracteres.';
    }
    
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    
    if (isSubmitting) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para responder'
      });
      return;
    }
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      if (onNotify) {
        onNotify({ 
          type: 'error', 
          title: 'Error de validación', 
          message: Object.values(validationErrors)[0]
        });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onReply(content.trim());
      setContent('');
      setErrors({});
    } catch (error) {
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error al publicar',
          message: 'No se pudo publicar tu respuesta. Intenta de nuevo.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  if (!show) return null;

  if (!show) return null;

  return (
    <div className="rf-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="rf-modal reply-modal enhanced-reply-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="rf-modal-header enhanced-reply-header">
          <h5>
            <i className="fas fa-reply"></i>
            {replyingTo?.parentId ? 'Responder a respuesta' : 'Responder al post'}
          </h5>
          <button 
            className="btn-close" 
            aria-label="Cerrar" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body enhanced-reply-body">
            
            {replyingTo && Object.keys(replyingTo).length > 0 && (
              <div className="replying-to-box enhanced-replying-to">
                <div className="replying-to-header">
                  <div className="quote-author">
                    <div className="quote-avatar">
                      {(replyingTo.author && replyingTo.author.length > 0) ? replyingTo.author[0].toUpperCase() : 'U'}
                    </div>
                    <div className="quote-info">
                      <span className="quote-author-name">{replyingTo.author || 'Usuario desconocido'}</span>
                      <span className="quote-type">
                        {replyingTo.parentId ? 'Respuesta' : 'Post original'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="replying-to-content">
                  <div className="quote-text">
                    {(replyingTo.content && typeof replyingTo.content === 'string' && replyingTo.content.length > 200) 
                      ? `${replyingTo.content.substring(0, 200)}...`
                      : replyingTo.content || 'Contenido no disponible'
                    }
                  </div>
                </div>
              </div>
            )}

            <div className="reply-compose-section">
              <label className="form-label enhanced-label" htmlFor="replyContent">
                <i className="fas fa-comment-dots"></i>
                Tu respuesta
              </label>
              
              <div className="textarea-container">
                <textarea
                  id="replyContent"
                  ref={textareaRef}
                  className={`form-control enhanced-textarea ${errors.content ? 'is-invalid' : ''}`}
                  placeholder={replyingTo?.parentId 
                    ? `Respondiendo a ${replyingTo.author}...`
                    : "Comparte tu opinión de manera constructiva..."
                  }
                  value={content}
                  onChange={handleContentChange}
                  rows={6}
                  maxLength={2000}
                  disabled={isSubmitting}
                />
                
                <div className="textarea-footer">
                  <div className="char-counter">
                    <span className={content.length > 1800 ? 'text-warning' : content.length > 1900 ? 'text-danger' : ''}>
                      {content.length}/2000
                    </span>
                  </div>
                </div>
              </div>
              
              {errors.content && (
                <div className="invalid-feedback enhanced-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.content}
                </div>
              )}
            </div>

            <div className="reply-guidelines">
              <div className="guideline-item">
                <i className="fas fa-heart"></i>
                <span>Sé respetuoso y constructivo</span>
              </div>
              <div className="guideline-item">
                <i className="fas fa-lightbulb"></i>
                <span>Aporta valor a la conversación</span>
              </div>
              <div className="guideline-item">
                <i className="fas fa-shield-alt"></i>
                <span>Respeta las normas de la comunidad</span>
              </div>
            </div>
          </div>

          <div className="rf-modal-footer enhanced-reply-footer">
            <div className="footer-left">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                <i className="fas fa-times"></i>
                Cancelar
              </button>
            </div>
            
            <div className="footer-right">
              <button 
                type="submit" 
                className={`btn btn-primary reply-submit-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting || !content.trim()}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Publicando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Publicar Respuesta
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostThreadModal;