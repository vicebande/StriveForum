import React, { useEffect, useState } from 'react';
import RecentActivity from './RecentActivity';

const Hero = ({ onRegister, onNavigate, isAuthenticated }) => {
  // URL de YouTube
  const ytUrl = 'https://www.youtube.com/watch?v=rTHvzAhWfgA';
  const match = ytUrl.match(/[?&]v=([^&#]+)/) || ytUrl.match(/youtu\.be\/([^&#]+)/);
  const ytId = match ? match[1] : null;
  const poster = '/static/img/hero-poster.jpg';

  const [embedActive, setEmbedActive] = useState(false);

  // Activar embed al montar para forzar carga con autoplay
  useEffect(() => {
    setEmbedActive(true);
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
              Encuentra foros, partidas y recursos. Únete a la comunidad para acceder al dashboard exclusivo.
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
          <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:16}}>
            <div className="hero-extra">
              <div className="card-custom p-3">
                <h4 style={{marginTop:0}}>Recursos destacados</h4>
                <p className="small text-muted">Guías rápidas, eventos y partidas recomendadas. Haz click para ir al foro correspondiente.</p>
                <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
                  <button className="btn btn-secondary" onClick={() => onNavigate('learning')}>Ver guías</button>
                  <button className="btn btn-primary" onClick={() => onNavigate('forums')}>Únete al foro</button>
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