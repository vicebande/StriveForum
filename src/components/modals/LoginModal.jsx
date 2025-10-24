import { useEffect, useState, useCallback } from 'react';

const LoginModal = ({ show, onClose, onLogin, onNotify }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      setAnimationClass('auth-modal-enter');
      
      // Reset animation class after animation completes
      const timer = setTimeout(() => {
        setAnimationClass('auth-modal-enter-active');
      }, 50);
      
      return () => clearTimeout(timer);
    } else if (isAnimating) {
      // Limpiar formulario cuando se cierra
      setUsername('');
      setPassword('');
      setErrors({});
      setIsSubmitting(false);
      
      setAnimationClass('auth-modal-exit');
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [show, isAnimating]);

  const handleClose = useCallback(() => {
    setAnimationClass('auth-modal-exit');
    setTimeout(() => {
      onClose();
    }, 250);
  }, [onClose]);

  const validate = () => {
    const e = {};
    
    // Validación de usuario
    if (!username || username.trim().length < 2) {
      e.username = 'Usuario requerido (mín. 2 caracteres).';
    }
    
    // Validación básica de contraseña - solo verificar que no esté vacía
    if (!password || password.trim().length === 0) {
      e.password = 'Contraseña requerida.';
    }
    
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
      if (onNotify) onNotify({ type: 'error', title: 'Error de login', message: Object.values(e).join(' ') });
      return;
    }

    // Add small delay for better UX feedback
    setTimeout(() => {
      onLogin({ 
        username: username.trim(), 
        password: password 
      });
      setIsSubmitting(false);
    }, 800);
  };

  if (!show && !isAnimating) return null;

  return (
    <div className={`rf-modal-backdrop auth-backdrop ${animationClass}`} onClick={handleClose}>
      <div className={`rf-modal auth-modal ${animationClass} ${isSubmitting ? 'submitting' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5><i className="fas fa-sign-in-alt"></i> Iniciar Sesión</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rf-modal-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="loginUsername">Usuario</label>
              <input 
                id="loginUsername"
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Tu nombre de usuario" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="loginPassword">Contraseña</label>
              <input 
                id="loginPassword"
                type="password" 
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Tu contraseña" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="small text-muted" style={{fontSize: '0.85rem', lineHeight: '1.5'}}>
              <i className="fas fa-info-circle" style={{color: 'var(--accent-blue)'}}></i> Solo puedes iniciar sesión con cuentas previamente registradas. Si no tienes cuenta, regístrate primero.
            </div>
          </div>

          <div className="rf-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isSubmitting}>
              <i className="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Iniciando...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Entrar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;