import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-code">
            <h1>404</h1>
            <div className="error-subtitle">PÁGINA NO ENCONTRADA</div>
          </div>
          
          <div className="error-message">
            <h2>¡Houston, tenemos un problema!</h2>
            <p>La página que buscas no existe en nuestro foro. Puede que haya sido movida, eliminada o que hayas escrito mal la URL.</p>
          </div>
          
          <div className="error-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-home"></i>
              Volver al Inicio
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/forums')}
            >
              <i className="fas fa-comments"></i>
              Explorar Foros
            </button>
            
            <button 
              className="btn btn-tertiary"
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left"></i>
              Página Anterior
            </button>
          </div>
          
          <div className="helpful-links">
            <div className="links-grid">
              <button 
                className="link-card"
                onClick={() => navigate('/dashboard')}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </button>
              <button 
                className="link-card"
                onClick={() => navigate('/learning')}
              >
                <i className="fas fa-book"></i>
                <span>Aprendizaje</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="error-decoration">
          <div className="floating-elements">
            <div className="element element-1">
              <i className="fas fa-fist-raised"></i>
            </div>
            <div className="element element-2">
              <i className="fas fa-fire"></i>
            </div>
            <div className="element element-3">
              <i className="fas fa-comments"></i>
            </div>
            <div className="element element-4">
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default NotFound;