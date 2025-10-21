import React, { useEffect, useState, useCallback } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const RegisterModal = ({ show, onClose, onRegister, onNotify }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (show) {
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setErrors({});
      setIsSubmitting(false);
      setPasswordStrength(0);
      setIsAnimating(true);
      setAnimationClass('auth-modal-enter');
      
      const timer = setTimeout(() => {
        setAnimationClass('auth-modal-enter-active');
      }, 50);
      
      return () => clearTimeout(timer);
    } else if (isAnimating) {
      setAnimationClass('auth-modal-exit');
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [show, isAnimating]);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const handleClose = useCallback(() => {
    setAnimationClass('auth-modal-exit');
    setTimeout(() => {
      onClose();
    }, 250);
  }, [onClose]);

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

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const e = validate();
    setErrors(e);
    
    if (Object.keys(e).length > 0) {
      setIsSubmitting(false);
      if (onNotify) onNotify({ type: 'error', title: 'Error de registro', message: Object.values(e).join(' ') });
      return;
    }

    // demo: simular "usuario ya existe"
    if (username.trim().toLowerCase() === 'existente') {
      setIsSubmitting(false);
      if (onNotify) onNotify({ type: 'error', title: 'Registro fallido', message: 'El nombre de usuario ya está en uso.' });
      setErrors({ username: 'Nombre de usuario ya existe.' });
      return;
    }

    // Add delay for better UX feedback
    setTimeout(() => {
      onRegister({ username: username.trim(), email: email.trim(), password });
      setIsSubmitting(false);
    }, 1200);
  };

  if (!show && !isAnimating) return null;

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return '#dc3545';
    if (passwordStrength <= 50) return '#fd7e14';
    if (passwordStrength <= 75) return '#ffc107';
    return '#28a745';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Muy débil';
    if (passwordStrength <= 50) return 'Débil';
    if (passwordStrength <= 75) return 'Media';
    return 'Fuerte';
  };

  return (
    <div className={`rf-modal-backdrop auth-backdrop ${animationClass}`} onClick={handleClose}>
      <div className={`rf-modal auth-modal ${animationClass} ${isSubmitting ? 'submitting' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5><i className="fas fa-user-plus"></i> Registrarse</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="regUsername">Usuario</label>
              <input 
                id="regUsername"
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Elige un nombre de usuario" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="regEmail">Correo electrónico</label>
              <input 
                id="regEmail"
                type="email" 
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="tu@correo.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="regPassword">Contraseña</label>
              <input 
                id="regPassword"
                type="password" 
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Crea una contraseña segura" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              {password && (
                <div className="password-strength-indicator mt-2">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor(),
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <small className="text-muted">
                    Fuerza: <span style={{ color: getPasswordStrengthColor(), fontWeight: '600' }}>
                      {getPasswordStrengthText()}
                    </span>
                  </small>
                </div>
              )}
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="regConfirm">Confirmar contraseña</label>
              <input 
                id="regConfirm"
                type="password" 
                className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
                placeholder="Repite tu contraseña" 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
              />
              {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
            </div>

            <div className="small text-muted" style={{fontSize: '0.85rem', lineHeight: '1.5'}}>
              <i className="fas fa-info-circle" style={{color: 'var(--accent-blue)'}}></i> La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas y números.
            </div>
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
              <i className="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creando cuenta...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Crear cuenta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;