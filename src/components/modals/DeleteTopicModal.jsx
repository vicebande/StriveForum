import { useState, useEffect, useRef } from 'react';

const DeleteTopicModal = ({ show, onClose, onDeleteTopic, topicTitle, onNotify }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setConfirmText('');
      setIsDeleting(false);
      setShowAnimation(false);
      // Dar foco al input al abrir con pequeño delay para la animación
      setTimeout(() => {
        inputRef.current?.focus();
        setShowAnimation(true);
      }, 150);
    }
  }, [show]);

  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (confirmText.trim().toUpperCase() !== 'ELIMINAR') {
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Confirmación incorrecta',
          message: 'Debes escribir exactamente "ELIMINAR" para confirmar'
        });
      }
      return;
    }

    setIsDeleting(true);

    try {
      await onDeleteTopic();
      onClose();
    } catch (error) {
      console.error('Error al eliminar topic:', error);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error',
          message: 'No se pudo eliminar el topic. Inténtalo nuevamente.'
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!show) return null;

  const canDelete = confirmText.trim().toUpperCase() === 'ELIMINAR';
  const progress = Math.min((confirmText.length / 8) * 100, 100); // 'ELIMINAR' tiene 8 caracteres

  return (
    <div 
      className="rf-modal-backdrop delete-modal-backdrop" 
      role="dialog" 
      aria-modal="true" 
      onClick={onClose}
    >
      <div 
        className={`rf-modal delete-topic-modal ${showAnimation ? 'modal-animate-in' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header mejorado con gradiente de peligro */}
        <div className="rf-modal-header delete-header">
          <div className="header-content">
            <div className="danger-icon-wrapper">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="header-text">
              <h5>Eliminar Topic Permanentemente</h5>
              <p className="header-subtitle">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button 
            className="modern-close" 
            aria-label="Cerrar" 
            onClick={onClose}
            disabled={isDeleting}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleDelete}>
          <div className="rf-modal-body delete-body">
            {/* Alerta animada con gradiente */}
            <div className="modern-alert" role="alert">
              <div className="alert-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div className="alert-content">
                <strong>Zona de Peligro</strong>
                <p>Esta operación eliminará permanentemente todo el contenido</p>
              </div>
            </div>

            {/* Topic destacado con mejor diseño */}
            <div className="topic-preview">
              <div className="topic-preview-header">
                <i className="fas fa-fire text-danger"></i>
                <span>Topic a eliminar</span>
              </div>
              <div className="topic-preview-content">
                <h6>"{topicTitle}"</h6>
                <div className="deletion-impact">
                  <div className="impact-item">
                    <i className="fas fa-comments"></i>
                    <span>Todos los posts</span>
                  </div>
                  <div className="impact-item">
                    <i className="fas fa-reply"></i>
                    <span>Todas las respuestas</span>
                  </div>
                  <div className="impact-item">
                    <i className="fas fa-heart"></i>
                    <span>Todos los votos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Campo de confirmación mejorado */}
            <div className="confirmation-section">
              <div className="confirmation-header">
                <i className="fas fa-key text-warning"></i>
                <span>Confirmación de Seguridad</span>
              </div>
              
              <div className="confirmation-instruction">
                <p>Para proceder, escribe <code className="confirm-code">ELIMINAR</code> en el campo de abajo:</p>
              </div>

              <div className="input-group-modern">
                <input
                  id="confirmDelete"
                  ref={inputRef}
                  type="text"
                  className={`form-control modern-input ${confirmText && !canDelete ? 'is-invalid' : canDelete ? 'is-valid' : ''}`}
                  placeholder="Escribe ELIMINAR para confirmar"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isDeleting}
                  autoComplete="off"
                  maxLength={8}
                />
                <div className="input-progress">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {confirmText && !canDelete && (
                <div className="feedback-message error">
                  <i className="fas fa-times-circle"></i>
                  Debes escribir exactamente "ELIMINAR"
                </div>
              )}

              {canDelete && (
                <div className="feedback-message success">
                  <i className="fas fa-check-circle"></i>
                  Confirmación correcta - Ya puedes eliminar
                </div>
              )}
            </div>

          </div>

          {/* Footer mejorado con botones más expresivos */}
          <div className="rf-modal-footer delete-footer">
            <div className="footer-actions">
              <button 
                type="button" 
                className="btn btn-outline-secondary modern-btn cancel-btn" 
                onClick={onClose}
                disabled={isDeleting}
              >
                <i className="fas fa-shield-alt"></i> 
                <span>Mantener Seguro</span>
              </button>
              
              <button 
                type="submit" 
                className={`btn modern-btn delete-btn ${!canDelete ? 'disabled' : canDelete ? 'danger-ready' : ''}`}
                disabled={!canDelete || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="btn-loading">
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    <span>Eliminar Permanentemente</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Indicador de progreso en el footer */}
            {isDeleting && (
              <div className="deletion-progress">
                <div className="progress-bar">
                  <div className="progress-fill animated"></div>
                </div>
                <span className="progress-text">Eliminando topic y todo su contenido...</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteTopicModal;