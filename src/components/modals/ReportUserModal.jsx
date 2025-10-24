import { useState, useEffect } from 'react';
import { 
  REPORT_REASONS, 
  REPORT_REASONS_LABELS, 
  canReportUser, 
  getReportCooldownRemaining, 
  formatCooldownTime,
  createReport 
} from '../../utils/roleUtils';

const ReportUserModal = ({ show, onClose, reportedUsername, postId, topicId, reporterUser, contentType = 'post', replyContent = null, onNotify }) => {
  const [reason, setReason] = useState(REPORT_REASONS.SPAM);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  // Verificar cooldown al abrir el modal
  // Verificar cooldown de reporte
  useEffect(() => {
    if (show && reporterUser && reportedUsername) {
      const canReport = canReportUser(reporterUser.username, reportedUsername);
      if (!canReport) {
        const remaining = getReportCooldownRemaining(reporterUser.username, reportedUsername);
        setCooldownRemaining(remaining);
        
        // Actualizar countdown cada segundo
        const interval = setInterval(() => {
          const newRemaining = getReportCooldownRemaining(reporterUser.username, reportedUsername);
          setCooldownRemaining(newRemaining);
          
          if (newRemaining <= 0) {
            clearInterval(interval);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      } else {
        setCooldownRemaining(0);
      }
    }
  }, [show, reporterUser, reportedUsername]);

  // Animaciones del modal
  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      setAnimationClass('auth-modal-enter');
      
      const timer = setTimeout(() => {
        setAnimationClass('auth-modal-enter-active');
      }, 50);
      
      return () => clearTimeout(timer);
    } else if (isAnimating) {
      // Limpiar formulario cuando se cierra
      setReason(REPORT_REASONS.SPAM);
      setDescription('');
      setIsSubmitting(false);
      
      setAnimationClass('auth-modal-exit');
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

    if (!canReportUser(reporterUser.username, reportedUsername)) {
      onNotify?.({
        type: 'warning',
        title: 'Espera un momento',
        message: `Debes esperar ${formatCooldownTime(cooldownRemaining)} para reportar a este usuario nuevamente`
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        reporterUsername: reporterUser.username,
        reportedUsername,
        reason,
        description: description.trim(),
        postId,
        topicId,
        contentType,
        replyContent
      };

      createReport(reportData);

      onNotify?.({
        type: 'success',
        title: 'Reporte enviado',
        message: `Tu reporte contra ${reportedUsername} ha sido enviado y será revisado por los administradores.`
      });

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

  if (!show && !isAnimating) return null;

  const canReport = reporterUser && canReportUser(reporterUser.username, reportedUsername);

  return (
    <div className={`rf-modal-backdrop auth-backdrop ${animationClass}`} onClick={handleClose}>
      <div className={`rf-modal auth-modal ${animationClass} ${isSubmitting ? 'submitting' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="rf-modal-header">
          <h5><i className="fas fa-flag"></i> Reportar {contentType === 'reply' ? 'Respuesta' : 'Usuario'}</h5>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {!canReport ? (
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