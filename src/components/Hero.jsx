import { useState, useMemo, useEffect } from 'react';
import RecentActivity from './RecentActivity';
import { getDashboardData } from '../services/api';

const Hero = ({ onRegister, onNavigate, isAuthenticated }) => {
  // URL de YouTube
  const ytUrl = 'https://www.youtube.com/watch?v=rTHvzAhWfgA';
  const match = ytUrl.match(/[?&]v=([^&#]+)/) || ytUrl.match(/youtu\.be\/([^&#]+)/);
  const ytId = match ? match[1] : null;
  const poster = '/static/img/hero-poster.jpg';

  const [embedActive] = useState(true); // Siempre activo
  const [communityStats, setCommunityStats] = useState({
    activeTopics: 0,
    registeredUsers: 0,
    totalReplies: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Cargar estadísticas reales desde la API
  useEffect(() => {
    const loadCommunityStats = async () => {
      try {
        setStatsLoading(true);
        const dashboardData = await getDashboardData();
        
        setCommunityStats({
          activeTopics: dashboardData.usersStats?.totalTopics || 0,
          registeredUsers: dashboardData.usersStats?.totalUsers || 0,
          totalReplies: dashboardData.usersStats?.totalPosts || 0
        });
      } catch (error) {
        console.error('Error loading community stats:', error);
        // Mantener valores por defecto en caso de error
      } finally {
        setStatsLoading(false);
      }
    };

    loadCommunityStats();
  }, []);

  const getEmbedSrc = () => {
    if (!ytId || !embedActive) return null;
    // autoplay=1 + mute=1 + loop=1 + playlist=VIDEO_ID (YouTube requiere playlist igual al id para loop)
    return `https://www.youtube.com/embed/${ytId}?rel=0&autoplay=1&mute=1&loop=1&playlist=${ytId}&modestbranding=1`;
  };

  const embedSrc = getEmbedSrc();

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-row">
          <div className="hero-content">
            <h1 className="small-accent">StriveForum</h1>
            <h2>Comparte, aprende y juega con la comunidad</h2>
            <p className="lead">
              Encuentra foros, partidas y recursos. Únete a la comunidad para interactuar con los usuarios.
            </p>

            <div className="hero-buttons">
              { !isAuthenticated ? (
                <button className="btn btn-primary" onClick={onRegister}>Registrarse</button>
              ) : (
                <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>Acceso rápido al Dashboard</button>
              )}
              <button className="btn btn-secondary" onClick={() => onNavigate('forums')}>Ver Foros</button>
            </div>
          </div>

          <div className="hero-video">
            {embedSrc ? (
              <div className="video-embed">
                <iframe
                  src={embedSrc}
                  title="StriveForum demo"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="card-custom" style={{position:'relative', display:'flex',alignItems:'center',justifyContent:'center',minHeight:260}}>
                <img src={poster} alt="Hero fallback" style={{maxWidth:'100%', borderRadius:8}} />
                <div style={{position:'absolute',bottom:12,left:12,color:'var(--muted)'}}>
                  Video de YouTube inválido o no disponible.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hero-activity-row" style={{marginTop:18}}>
          <div className="hero-activity-container">
            <div className="hero-featured-section">
              <div className="card-custom">
                <h4>Centro de la Comunidad</h4>
                <p className="text-muted">Estadísticas en tiempo real y herramientas de la comunidad StriveForum</p>
                
                <div className="community-stats">
                  <div className="stat-item">
                    <div className="stat-number">
                      {statsLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        communityStats.activeTopics
                      )}
                    </div>
                    <div className="stat-label">Topics Activos</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {statsLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        communityStats.registeredUsers
                      )}
                    </div>
                    <div className="stat-label">Usuarios Registrados</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {statsLoading ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        communityStats.totalReplies
                      )}
                    </div>
                    <div className="stat-label">Respuestas</div>
                  </div>
                </div>
              </div>
            </div>

            <RecentActivity onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;