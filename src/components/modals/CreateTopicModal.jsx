import React, { useState, useEffect, useRef, useCallback } from 'react';

const CreateTopicModal = ({ show, onClose, onCreateTopic, onNotify }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);

  const getCurrentUser = useCallback(() => {
    try {
      const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
      return session.user || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (show) {
      setTitle('');
      setContent('');
      setCategory('general');
      setErrors({});
      // dar foco al título al abrir
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [show]);

  const validate = () => {
    const e = {};
    if (!title || title.trim().length < 5) e.title = 'El título debe tener al menos 5 caracteres.';
    if (!content || content.trim().length < 10) e.content = 'El contenido debe tener al menos 10 caracteres.';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      if (onNotify) onNotify({
        type: 'warning',
        title: 'Acceso requerido',
        message: 'Debes iniciar sesión para crear un topic'
      });
      return;
    }
    
    const e = validate();
    setErrors(e);

    if (Object.keys(e).length > 0) {
      if (onNotify) onNotify({ type: 'error', title: 'Error de validación', message: Object.values(e).join(' ') });
      return;
    }

    onCreateTopic({
      title: title.trim(),
      content: content.trim(),
      category
    });
  };

  if (!show) return null;

  return (
    <div className="rf-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="rf-modal create-topic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5><i className="fas fa-plus-circle"></i> Crear Nuevo Topic</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="topicCategory"><i className="fas fa-folder"></i> Categoría</label>
              <select id="topicCategory" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">💬 General</option>
                <option value="estrategias">🎯 Estrategias</option>
                <option value="armas">🔫 Armas y Equipamiento</option>
                <option value="mapas">🗺️ Mapas</option>
                <option value="competitivo">🏆 Competitivo</option>
                <option value="casual">🎮 Casual</option>
                <option value="bugs">🐛 Bugs y Problemas</option>
                <option value="sugerencias">💡 Sugerencias</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="topicTitle"><i className="fas fa-heading"></i> Título del Topic</label>
              <input
                id="topicTitle"
                ref={titleRef}
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="Escribe un título descriptivo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              <small className="form-text">{title.length}/100 caracteres</small>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="topicContent"><i className="fas fa-align-left"></i> Contenido</label>
              <textarea
                id="topicContent"
                className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                placeholder="Describe tu tema en detalle..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                maxLength={2000}
              />
              {errors.content && <div className="invalid-feedback">{errors.content}</div>}
              <small className="form-text">{content.length}/2000 caracteres</small>
            </div>

            <div className="topic-guidelines">
              <i className="fas fa-info-circle"></i>
              <div>
                <strong>Consejos para un buen topic:</strong>
                <ul>
                  <li>Usa un título claro y descriptivo</li>
                  <li>Proporciona detalles suficientes en el contenido</li>
                  <li>Selecciona la categoría apropiada</li>
                  <li>Respeta las normas de la comunidad</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}><i className="fas fa-times"></i> Cancelar</button>
            <button type="submit" className="btn btn-primary"><i className="fas fa-paper-plane"></i> Publicar Topic</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;