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
      
      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #000000, #1a0000);
          display: flex;
          align-items: center;
          padding: 120px 0 40px 0;
          position: relative;
          overflow: hidden;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
          z-index: 2;
        }
        
        .not-found-content {
          text-align: center;
          color: var(--text-light, #f5f5f5);
          max-width: 800px;
          margin: 0 auto;
        }
        
        .error-code {
          margin-bottom: 2rem;
        }
        
        .error-code h1 {
          font-size: 10rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #e53935, #ffc107);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 8px 16px rgba(229, 57, 53, 0.3);
          letter-spacing: -0.02em;
        }
        
        .error-subtitle {
          font-size: 1.2rem;
          letter-spacing: 0.3em;
          color: var(--accent-red, #e53935);
          font-weight: 600;
          margin-top: 0.5rem;
        }
        
        .error-message {
          margin: 3rem 0;
          padding: 2rem;
          background: var(--bg-card, #111111);
          border-radius: 12px;
          border: 1px solid var(--border-color, rgba(255,255,255,0.1));
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .error-message h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--text-primary, #ffffff);
          font-weight: 700;
        }
        
        .error-message p {
          font-size: 1.1rem;
          color: var(--text-muted, rgba(255,255,255,0.9));
          line-height: 1.7;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 3rem 0;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          min-width: 160px;
          justify-content: center;
        }
        
        .btn-primary {
          background: var(--accent-red, #e53935);
          color: white;
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
        }
        
        .btn-primary:hover {
          background: var(--accent-red-dark, #b71c1c);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(229, 57, 53, 0.4);
        }
        
        .btn-secondary {
          background: var(--accent-yellow, #ffc107);
          color: #000;
          box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        }
        
        .btn-secondary:hover {
          background: var(--accent-gold, #ffd700);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
        }
        
        .btn-tertiary {
          background: var(--bg-card, #111111);
          color: var(--text-light, #f5f5f5);
          border: 2px solid var(--border-color, rgba(255,255,255,0.1));
        }
        
        .btn-tertiary:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--accent-blue, #238be6);
          transform: translateY(-2px);
        }
        
        .helpful-links {
          margin-top: 4rem;
        }
        
        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .link-card {
          background: var(--bg-card, #111111);
          border: 1px solid var(--border-color, rgba(255,255,255,0.1));
          border-radius: 12px;
          padding: 1.5rem;
          color: var(--text-light, #f5f5f5);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }
        
        .link-card:hover {
          background: rgba(229, 57, 53, 0.1);
          border-color: var(--accent-red, #e53935);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        
        .link-card i {
          font-size: 1.5rem;
          color: var(--accent-red, #e53935);
        }
        
        .link-card span {
          font-weight: 600;
          font-size: 0.95rem;
        }
        
        .error-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }
        
        .floating-elements {
          position: relative;
          height: 100%;
        }
        
        .element {
          position: absolute;
          font-size: 2.5rem;
          color: rgba(229, 57, 53, 0.1);
          animation: float 8s ease-in-out infinite;
        }
        
        .element-1 {
          top: 15%;
          left: 8%;
          animation-delay: 0s;
          color: rgba(229, 57, 53, 0.15);
        }
        
        .element-2 {
          top: 25%;
          right: 12%;
          animation-delay: 2s;
          color: rgba(255, 193, 7, 0.15);
        }
        
        .element-3 {
          bottom: 35%;
          left: 10%;
          animation-delay: 4s;
          color: rgba(35, 139, 230, 0.15);
        }
        
        .element-4 {
          bottom: 20%;
          right: 15%;
          animation-delay: 6s;
          color: rgba(229, 57, 53, 0.1);
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.1;
          }
          25% { 
            transform: translateY(-15px) rotate(90deg) scale(1.1); 
            opacity: 0.2;
          }
          50% { 
            transform: translateY(-30px) rotate(180deg) scale(1); 
            opacity: 0.15;
          }
          75% { 
            transform: translateY(-15px) rotate(270deg) scale(1.1); 
            opacity: 0.2;
          }
        }
        
        @media (max-width: 768px) {
          .not-found-page {
            padding: 100px 0 20px 0;
          }
          
          .error-code h1 {
            font-size: 6rem;
          }
          
          .error-subtitle {
            font-size: 1rem;
            letter-spacing: 0.2em;
          }
          
          .error-message {
            margin: 2rem 0;
            padding: 1.5rem;
          }
          
          .error-message h2 {
            font-size: 1.5rem;
          }
          
          .error-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            min-width: 200px;
          }
          
          .links-grid {
            grid-template-columns: 1fr;
            max-width: 250px;
          }
          
          .element {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .error-code h1 {
            font-size: 4rem;
          }
          
          .error-message h2 {
            font-size: 1.3rem;
          }
          
          .error-message p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;