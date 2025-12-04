import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  REPORT_REASONS, 
  REPORT_REASONS_LABELS, 
  canReportUser, 
  getReportCooldownRemaining, 
  formatCooldownTime,
  createReport,
  REPORT_COOLDOWN_MS 
} from '../../utils/roleUtils';
import { ReportsAPI, UsersAPI, TopicsAPI } from '../../services/api';

const ReportUserModal = ({ show, onClose, reportedUsername, postId, topicId, reporterUser, contentType = 'post', replyContent = null, onNotify }) => {
  const [reason, setReason] = useState(REPORT_REASONS.SPAM);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  // Verificar cooldown simplificado (solo localStorage por ahora)
  const checkCooldown = useCallback(() => {
    if (!reporterUser || !reportedUsername) return { canReport: true, remaining: 0 };

    try {
      // Verificar si puede reportar usando localStorage
      const canReportResult = canReportUser(reporterUser.username, reportedUsername);
      const remaining = canReportResult ? 0 : getReportCooldownRemaining(reporterUser.username, reportedUsername);
      
      return { canReport: canReportResult, remaining };
    } catch (error) {
      console.error('Error checking cooldown:', error);
      return { canReport: true, remaining: 0 };
    }
  }, [reporterUser, reportedUsername]);

  // Verificar cooldown al abrir el modal
  useEffect(() => {
    let interval;
    let isMounted = true;
    
    if (show && reporterUser && reportedUsername) {
      const updateCooldown = async () => {
        try {
          const { canReport, remaining } = checkCooldown();
          if (isMounted) {
            setCooldownRemaining(remaining);
          }
          return remaining > 0;
        } catch (error) {
          console.error('Error updating cooldown:', error);
          if (isMounted) {
            setCooldownRemaining(0);
          }
          return false;
        }
      };

      // Verificar inicialmente
      const timeoutId = setTimeout(() => {
        if (!isMounted) return;
        
        try {
          const hasRemainingTime = updateCooldown();
          
          // Si hay tiempo restante, configurar interval
          if (hasRemainingTime && isMounted) {
            interval = setInterval(() => {
              if (!isMounted) return;
              
              const stillHasTime = updateCooldown();
              if (!stillHasTime && interval) {
                clearInterval(interval);
                interval = null;
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Error in cooldown effect:', error);
        }
      }, 10);

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Solo actualizar si el componente está montado
      if (isMounted) {
        setCooldownRemaining(0);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [show, reporterUser, reportedUsername, checkCooldown]);

  // Animaciones del modal
  useEffect(() => {
    if (show) {
      Promise.resolve().then(() => {
        setIsAnimating(true);
        setAnimationClass('auth-modal-enter');
      });
      const timer = setTimeout(() => {
        setAnimationClass('auth-modal-enter-active');
      }, 50);
      return () => clearTimeout(timer);
    } else if (isAnimating) {
      // Limpiar formulario cuando se cierra
      Promise.resolve().then(() => {
        setReason(REPORT_REASONS.SPAM);
        setDescription('');
        setIsSubmitting(false);
        setAnimationClass('auth-modal-exit');
      });
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [show, isAnimating]);

  const handleClose = () => {
    setAnimationClass('auth-modal-exit');
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reporterUser) {
      onNotify?.({
        type: 'error',
        title: 'Error',
        message: 'Debes iniciar sesión para reportar usuarios'
      });
      return;
    }

    // Verificar cooldown usando el estado actual
    if (cooldownRemaining > 0) {
      onNotify?.({
        type: 'warning',
        title: 'Espera un momento',
        message: `Debes esperar ${formatCooldownTime(cooldownRemaining)} para reportar a este usuario nuevamente`
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Iniciando envío de reporte:', { reporterUser: reporterUser.username, reportedUsername, reason, description });
      
      // Intentar enviar a la API primero
      try {
        console.log('📡 Obteniendo usuarios de la API...');
        // Obtener usuarios para conseguir los IDs
        const allUsers = await UsersAPI.getAll();
        console.log('🌐 Usuarios obtenidos:', allUsers.length, allUsers);
        console.log('🔍 Buscando reporterUser:', reporterUser.username);
        console.log('🔍 Buscando reportedUsername:', reportedUsername);
        
        const reporterUserData = allUsers.find(u => u.username === reporterUser.username);
        const reportedUserData = allUsers.find(u => u.username === reportedUsername);
        
        console.log('🌐 Datos encontrados:', { 
          reporterUserData: reporterUserData || 'NO ENCONTRADO', 
          reportedUserData: reportedUserData || 'NO ENCONTRADO' 
        });
        console.log('🔍 Usernames en BD:', allUsers.map(u => u.username));
        
        if (!reporterUserData || !reportedUserData) {
          throw new Error('No se pudieron encontrar los usuarios en la base de datos');
        }

        // Verificar que el topic existe si se proporciona un topicId
        let validTopicId = null;
        if (topicId) {
          try {
            const topics = await TopicsAPI.getAll();
            const topicExists = topics.some(t => t.id === topicId);
            validTopicId = topicExists ? topicId : null;
          } catch (error) {
            console.warn('Could not verify topic existence:', error);
            validTopicId = null;
          }
        }

        const apiReportData = {
          reporter_id: reporterUserData.id,
          reported_user_id: reportedUserData.id,
          reason,
          description: description.trim() || null,
          post_id: postId || null,
          topic_id: validTopicId
        };
        
        const result = await ReportsAPI.create(apiReportData);
        
        onNotify?.({
          type: 'success',
          title: 'Reporte enviado',
          message: `Tu reporte contra ${reportedUsername} ha sido enviado y será revisado por los administradores.`
        });

      } catch (apiError) {
        console.warn('API failed, using localStorage fallback:', apiError);
        
        // Fallback a localStorage si la API falla
        const localReportData = {
          reporterUsername: reporterUser.username,
          reportedUsername,
          reason,
          description: description.trim(),
          postId,
          topicId,
          contentType,
          replyContent
        };
        
        createReport(localReportData);
        
        onNotify?.({
          type: 'success',
          title: 'Reporte enviado',
          message: `Tu reporte contra ${reportedUsername} ha sido guardado localmente y será procesado.`
        });
      }

      // Pequeño delay para mejor UX
      setTimeout(() => {
        setIsSubmitting(false);
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('Error creating report:', error);
      onNotify?.({
        type: 'error',
        title: 'Error',
        message: 'No se pudo enviar el reporte. Inténtalo nuevamente.'
      });
      setIsSubmitting(false);
    }
  };

  // Determinar si el usuario puede reportar (simplificado)
  const canReport = useMemo(() => {
    return reporterUser && cooldownRemaining === 0;
  }, [reporterUser, cooldownRemaining]);

  // Determinar si hay cooldown activo
  const hasCooldown = cooldownRemaining > 0;

  if (!show && !isAnimating) return null;

  return (
    <div className={`rf-modal-backdrop auth-backdrop ${animationClass}`} onClick={handleClose}>
      <div className={`rf-modal auth-modal ${animationClass} ${isSubmitting ? 'submitting' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5><i className="fas fa-flag"></i> Reportar {contentType === 'reply' ? 'Respuesta' : 'Usuario'}</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {hasCooldown ? (
          <div className="rf-modal-body text-center p-4">
            <div className="alert alert-warning">
              <i className="fas fa-clock mb-2" style={{ fontSize: '2rem' }}></i>
              <h6>Debes esperar para reportar a este usuario</h6>
              <p className="mb-2">
                Tiempo restante: <strong>{formatCooldownTime(cooldownRemaining)}</strong>
              </p>
              <small className="text-muted">
                Para evitar spam, solo puedes reportar al mismo usuario cada 20 minutos.
              </small>
            </div>
            <button className="btn btn-secondary" onClick={handleClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rf-modal-body">
              <div className="mb-3">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Reportando {contentType === 'reply' ? 'respuesta de' : 'a'}: {reportedUsername}</strong>
                </div>
                {contentType === 'reply' && replyContent && (
                  <div className="alert alert-secondary mt-2">
                    <strong>Contenido reportado:</strong>
                    <div className="mt-2 p-2 bg-light rounded" style={{maxHeight: '100px', overflowY: 'auto'}}>
                      {replyContent}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="reportReason">Motivo del reporte</label>
                <select 
                  id="reportReason"
                  className="form-control report-reason-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  {Object.entries(REPORT_REASONS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="reportDescription">
                  Descripción adicional (opcional)
                </label>
                <textarea
                  id="reportDescription"
                  className="form-control"
                  placeholder="Proporciona más detalles sobre el motivo del reporte..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <small className="text-muted">
                  {description.length}/500 caracteres
                </small>
              </div>

              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <small>
                  Los reportes falsos o malintencionados pueden resultar en sanciones contra tu cuenta.
                </small>
              </div>
            </div>

            <div className="rf-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-flag me-2"></i>
                    Enviar Reporte
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportUserModal;