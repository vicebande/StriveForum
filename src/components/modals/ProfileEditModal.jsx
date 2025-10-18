import React, { useEffect, useState } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfileEditModal = ({ show, onClose, currentData = {}, onSave, existingUsernames = [], onNotify }) => {
  const [username, setUsername] = useState(currentData.username || '');
  const [email, setEmail] = useState(currentData.email || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setUsername(currentData.username || '');
      setEmail(currentData.email || '');
      setErrors({});
    }
  }, [show, currentData]);

  const validate = () => {
    const e = {};
    if (!username || username.trim().length < 2) e.username = 'Usuario inválido (mín. 2 caracteres).';
    // comprobar unicidad: existingUsernames contiene minúsculas; ignorar el actual
    const lower = username.trim().toLowerCase();
    const currentLower = (currentData.username || '').toLowerCase();
    if (lower !== currentLower && existingUsernames.includes(lower)) {
      e.username = 'El nombre de usuario ya está en uso.';
    }
    if (!email || !emailRegex.test(email)) e.email = 'Correo inválido.';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (onNotify) onNotify({ type: 'error', title: 'Error al actualizar', message: Object.values(e).join(' ') });
      return;
    }

    // éxito: pasar sólo campos que se editaron
    const updated = { username: username.trim(), email: email.trim() };
    onSave(updated);
    if (onNotify) onNotify({ type: 'success', title: 'Perfil', message: 'Perfil actualizado correctamente.' });
  };

  if (!show) return null;

  return (
    <div className="rf-modal-backdrop" onMouseDown={onClose}>
      <div className="rf-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5>Editar perfil</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            <label className="form-label">Usuario</label>
            <input className="form-control mb-2" value={username} onChange={(e) => setUsername(e.target.value)} />
            {errors.username && <div className="text-danger small">{errors.username}</div>}

            <label className="form-label mt-2">Correo</label>
            <input type="email" className="form-control mb-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <div className="text-danger small">{errors.email}</div>}
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;