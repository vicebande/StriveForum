import { useEffect, useState, useCallback } from 'react';

const NewPostModal = ({ show, onClose, onSubmit, onNotify }) => {
  const getCurrentUser = useCallback(() => {
    try {
      const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
      return session.user || null;
    } catch {
      return null;
    }
  }, []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setTitle('');
      setDescription('');
      setMessage('');
      setErrors({});
      setTimeout(() => {
        const el = document.querySelector('.new-post-modal input');
        if (el) el.focus();
      }, 40);
    }
  }, [show]);

  if (!show) return null;

  const validate = () => {
    const e = {};
    if (!title || title.trim().length < 3) e.title = 'Título requerido (mín. 3 caracteres).';
    if (!description || description.trim().length < 5) e.description = 'Descripción requerida (mín. 5 caracteres).';
    if (!message || message.trim().length < 3) e.message = 'Mensaje requerido (mín. 3 caracteres).';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para crear un post'
      });
      return;
    }
    
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (onNotify) onNotify({ type: 'error', title: 'Formulario incompleto', message: Object.values(e).join(' ') });
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim(), message: message.trim() });
  };

  return (
    <div className="rf-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="rf-modal new-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5><i className="fas fa-edit"></i> Crear Nueva Publicación</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="postTitle"><i className="fas fa-heading"></i> Título</label>
              <input 
                id="postTitle"
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="Escribe un título atractivo..."
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              <small className="form-text">{title.length}/80 caracteres</small>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="postDescription"><i className="fas fa-info-circle"></i> Descripción</label>
              <input 
                id="postDescription"
                type="text"
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                placeholder="Resume brevemente tu publicación..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                maxLength={120}
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              <small className="form-text">{description.length}/120 caracteres</small>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="postMessage"><i className="fas fa-align-left"></i> Contenido</label>
              <textarea 
                id="postMessage"
                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                placeholder="Escribe el contenido de tu publicación en detalle..."
                rows="8"
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1500}
              />
              {errors.message && <div className="invalid-feedback">{errors.message}</div>}
              <small className="form-text">{message.length}/1500 caracteres</small>
            </div>

            <div className="post-guidelines">
              <i className="fas fa-lightbulb"></i>
              <div>
                <strong>Consejos para una buena publicación:</strong>
                <ul>
                  <li>Usa un título claro y específico</li>
                  <li>Incluye una descripción que resuma el tema</li>
                  <li>Desarrolla tu idea completamente en el contenido</li>
                  <li>Mantén un tono respetuoso y constructivo</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <i className="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-paper-plane"></i> Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPostModal;