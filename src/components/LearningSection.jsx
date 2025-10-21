import React, { useState, useCallback, useMemo } from 'react';

const LearningSection = () => {
    const [selectedGame, setSelectedGame] = useState('ggst');

    const gameData = useMemo(() => ({
        ggst: {
            name: 'Guilty Gear Strive',
            icon: '⚔️',
            color: 'linear-gradient(135deg, #ff6b35, #f7931e)',
            description: 'El juego de lucha 2.5D más espectacular con mecánicas únicas y combos devastadores.',
            tutorials: 'https://www.youtube.com/playlist?list=PLp6Lo3-1jBR8EjZZcy-9L0xgEZvYEH8B_',
            combos: 'https://www-thegamer-com.translate.goog/guilty-gear-strive-every-character-command-list/?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc',
            frameData: 'https://www.dustloop.com/w/GGST/Frame_Data'
        },
        sf6: {
            name: 'Street Fighter 6',
            icon: '👊',
            color: 'linear-gradient(135deg, #1e88e5, #039be5)',
            description: 'La nueva generación de Street Fighter con mecánicas renovadas y estilo único.',
            tutorials: 'https://www.streetfighter.com/6/es-es/character',
            combos: 'https://wiki.supercombo.gg/w/Street_Fighter_6',
            frameData: 'https://ultimateframedata.com/sf6'
        }
    }), []);

    const learningResources = useMemo(() => [
        {
            id: 'tutorials',
            icon: 'fa-play-circle',
            title: 'Tutoriales Interactivos',
            description: 'Videos paso a paso y guías detalladas para dominar cada aspecto del juego.',
            features: ['Guías para principiantes', 'Tutoriales avanzados', 'Análisis de personajes'],
            buttonText: 'Ver Tutoriales'
        },
        {
            id: 'combos',
            icon: 'fa-fist-raised',
            title: 'Comandos & Combos',
            description: 'Lista completa de movimientos, combos y estrategias para cada personaje.',
            features: ['Lista de comandos', 'Combos básicos', 'Estrategias avanzadas'],
            buttonText: 'Explorar Combos'
        },
        {
            id: 'frameData',
            icon: 'fa-chart-bar',
            title: 'Frame Data & Análisis',
            description: 'Datos técnicos precisos para análisis profundo y optimización de estrategias.',
            features: ['Frames de inicio', 'Ventajas/desventajas', 'Hitboxes y hurtboxes'],
            buttonText: 'Analizar Datos'
        }
    ], []);

    const handleGameChange = useCallback((gameKey) => {
        setSelectedGame(gameKey);
    }, []);

    const openLink = useCallback((linkType) => {
        const url = gameData[selectedGame][linkType];
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, [selectedGame, gameData]);

    const currentGame = gameData[selectedGame];

    return (
        <section className="learning-section">
            <div className="container">
                {/* Header */}
                <div className="learning-header">
                    <div className="learning-title-wrapper">
                        <h1 className="learning-title">
                            <i className="fas fa-graduation-cap me-3" />
                            Centro de Aprendizaje
                        </h1>
                        <p className="learning-subtitle">
                            Mejora tus habilidades con recursos especializados y guías profesionales
                        </p>
                    </div>
                </div>

                {/* Game Selection */}
                <div className="game-selection">
                    <h3 className="selection-title">Selecciona tu juego</h3>
                    <div className="game-cards">
                        {Object.entries(gameData).map(([key, game]) => (
                            <button
                                key={key}
                                className={`game-card ${selectedGame === key ? 'active' : ''}`}
                                onClick={() => handleGameChange(key)}
                            >
                                <div className="game-icon" style={{ background: game.color }}>
                                    <span>{game.icon}</span>
                                </div>
                                <div className="game-info">
                                    <h4>{game.name}</h4>
                                    <p>{game.description}</p>
                                </div>
                                <div className="game-indicator">
                                    <i className="fas fa-check" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Current Game Info */}
                <div className="current-game-banner" style={{ background: currentGame.color }}>
                    <div className="banner-content">
                        <div className="banner-icon">
                            <span>{currentGame.icon}</span>
                        </div>
                        <div className="banner-info">
                            <h2>Aprendiendo {currentGame.name}</h2>
                            <p>Recursos especializados para mejorar tu nivel competitivo</p>
                        </div>
                    </div>
                </div>

                {/* Learning Resources */}
                <div className="learning-resources">
                    <h3 className="resources-title">
                        <i className="fas fa-book-open me-2" />
                        Recursos de Aprendizaje
                    </h3>
                    <div className="resources-grid">
                        {learningResources.map((resource) => (
                            <div key={resource.id} className="resource-card card-custom">
                                <div className="resource-header">
                                    <div className="resource-icon">
                                        <i className={`fas ${resource.icon}`} />
                                    </div>
                                    <div className="resource-title-section">
                                        <h4>{resource.title}</h4>
                                        <p>{resource.description}</p>
                                    </div>
                                </div>
                                
                                <div className="resource-features">
                                    <ul>
                                        {resource.features.map((feature, index) => (
                                            <li key={index}>
                                                <i className="fas fa-check-circle" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="resource-action">
                                    <button
                                        className="btn btn-primary resource-btn"
                                        onClick={() => openLink(resource.id)}
                                    >
                                        <i className="fas fa-external-link-alt me-2" />
                                        {resource.buttonText}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Tips */}
                <div className="learning-tips">
                    <div className="tips-card card-custom">
                        <div className="tips-header">
                            <i className="fas fa-lightbulb" />
                            <h3>Consejos para el Aprendizaje</h3>
                        </div>
                        <div className="tips-content">
                            <div className="tip-item">
                                <i className="fas fa-clock" />
                                <div>
                                    <strong>Práctica constante:</strong> Dedica al menos 30 minutos diarios para mejorar consistentemente.
                                </div>
                            </div>
                            <div className="tip-item">
                                <i className="fas fa-users" />
                                <div>
                                    <strong>Comunidad:</strong> Únete a foros y grupos para compartir conocimientos y estrategias.
                                </div>
                            </div>
                            <div className="tip-item">
                                <i className="fas fa-video" />
                                <div>
                                    <strong>Análisis de replays:</strong> Revisa tus partidas para identificar áreas de mejora.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LearningSection;