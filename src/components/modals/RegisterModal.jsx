import React, { useEffect, useState } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const RegisterModal = ({ show, onClose, onRegister, onNotify }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setErrors({});
    }
  }, [show]);

  const validate = () => {
    const e = {};
    if (!username || username.trim().length < 2) e.username = 'Usuario requerido (mín. 2 caracteres).';
    if (!email || !emailRegex.test(email)) e.email = 'Correo inválido. Usa formato usuario@dominio.ext';
    if (!password) e.password = 'Contraseña requerida.';
    else if (!strongPwdRegex.test(password)) {
      e.password = 'Contraseña débil: mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.';
    }
    if (confirm !== password) e.confirm = 'Las contraseñas no coinciden.';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (onNotify) onNotify({ type: 'error', title: 'Error de registro', message: Object.values(e).join(' ') });
      return;
    }

    // demo: simular "usuario ya existe"
    if (username.trim().toLowerCase() === 'existente') {
      if (onNotify) onNotify({ type: 'error', title: 'Registro fallido', message: 'El nombre de usuario ya está en uso.' });
      setErrors({ username: 'Nombre de usuario ya existe.' });
      return;
    }

    onRegister({ username: username.trim(), email: email.trim(), password });
  };

  if (!show) return null;

  return (
    <div className="rf-modal-backdrop" onMouseDown={onClose}>
      <div className="rf-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5>Registrarse</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            <label className="form-label">Usuario</label>
            <input className="form-control mb-2" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
            {errors.username && <div className="text-danger small">{errors.username}</div>}

            <label className="form-label mt-2">Correo</label>
            <input type="email" className="form-control mb-2" placeholder="correo@dominio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <div className="text-danger small">{errors.email}</div>}

            <label className="form-label mt-2">Contraseña</label>
            <input type="password" className="form-control mb-2" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <div className="text-danger small">{errors.password}</div>}

            <label className="form-label mt-2">Confirmar contraseña</label>
            <input type="password" className="form-control" placeholder="Repite la contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {errors.confirm && <div className="text-danger small">{errors.confirm}</div>}

            <div className="mt-2 small text-muted">La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.</div>
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Crear cuenta</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;