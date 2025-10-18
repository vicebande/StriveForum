import React, { useEffect, useState } from 'react';

const PostModal = ({ show, mode = 'reply', onClose, onSubmit, onNotify }) => {
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
      // small delay to focus first field
      setTimeout(() => {
        const el = document.querySelector('.post-modal input, .post-modal textarea');
        if (el) el.focus();
      }, 50);
    }
  }, [show, mode]);

  if (!show) return null;

  const validate = () => {
    const e = {};
    if (mode === 'topic') {
      if (!title || title.trim().length < 3) e.title = 'Título requerido (mín. 3 caracteres).';
      if (!description || description.trim().length < 5) e.description = 'Descripción requerida (mín. 5 caracteres).';
    }
    if (!message || message.trim().length < 3) e.message = 'Mensaje requerido (mín. 3 caracteres).';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (onNotify) onNotify({ type: 'error', title: 'Formulario incompleto', message: Object.values(e).join(' ') });
      return;
    }

    // enviar datos al handler padre
    const payload = {
      title: mode === 'topic' ? title.trim() : undefined,
      description: mode === 'topic' ? description.trim() : undefined,
      message: message.trim()
    };

    try {
      onSubmit(payload);
      if (onNotify && mode === 'topic') onNotify({ type: 'success', title: 'Topic creado', message: 'Tu topic fue creado correctamente.' });
      if (onNotify && mode === 'reply') onNotify({ type: 'info', title: 'Respuesta enviada', message: 'Tu respuesta fue añadida.' });
    } catch (err) {
      if (onNotify) onNotify({ type: 'error', title: 'Error', message: err.message || 'Ocurrió un error.' });
    }
  };

  return (
    <div className="rf-modal-backdrop" onMouseDown={onClose}>
      <div className="rf-modal post-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="rf-modal-header">
          <h5 style={{margin:0}}>{mode === 'topic' ? 'Crear nuevo topic' : 'Responder'}</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            {mode === 'topic' && (
              <>
                <label className="form-label">Título</label>
                <input className="form-control mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
                {errors.title && <div className="text-danger small">{errors.title}</div>}

                <label className="form-label mt-2">Descripción</label>
                <input className="form-control mb-2" value={description} onChange={(e) => setDescription(e.target.value)} />
                {errors.description && <div className="text-danger small">{errors.description}</div>}
              </>
            )}

            <label className="form-label mt-2">{mode === 'topic' ? 'Mensaje inicial' : 'Mensaje'}</label>
            <textarea className="form-control" rows="6" value={message} onChange={(e) => setMessage(e.target.value)} />
            {errors.message && <div className="text-danger small">{errors.message}</div>}
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{mode === 'topic' ? 'Crear Topic' : 'Enviar respuesta'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;