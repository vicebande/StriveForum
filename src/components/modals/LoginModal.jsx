import React, { useEffect, useState } from 'react';

const LoginModal = ({ show, onClose, onLogin, onNotify }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setUsername('');
      setPassword('');
      setErrors({});
    }
  }, [show]);

  const validate = () => {
    const e = {};
    if (!username || username.trim().length < 2) e.username = 'Ingresa un usuario válido (mín. 2 caracteres).';
    if (!password || password.length < 4) e.password = 'Ingresa la contraseña.';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // notificación de error
      if (onNotify) onNotify({ type: 'error', title: 'Error de login', message: Object.values(e).join(' ') });
      return;
    }

    // demo: aquí podrías llamar API; si falla, usar onNotify con type:error
    // Simulación de fallo: si username === 'noexiste' => usuario no encontrado
    if (username.trim() === 'noexiste') {
      if (onNotify) onNotify({ type: 'error', title: 'Credenciales inválidas', message: 'Usuario no encontrado.' });
      setErrors({ username: 'Usuario no encontrado.' });
      return;
    }

    // demo success
    onLogin(username.trim());
  };

  if (!show) return null;

  return (
    <div className="rf-modal-backdrop" onMouseDown={onClose}>
      <div className="rf-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5>Iniciar sesión</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            <label className="form-label">Usuario</label>
            <input
              className="form-control mb-2"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <div className="text-danger small">{errors.username}</div>}

            <label className="form-label mt-2">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className="text-danger small">{errors.password}</div>}
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Entrar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;