import React, { useState } from 'react';

const MatchmakingSection = () => {
    const [game, setGame] = useState('');
    const [level, setLevel] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to search for a match goes here
    };

    return (
        <section id="matchmakingSection" className="content-section">
            <div className="container">
                <h2 className="mb-4"><i className="fas fa-gamepad"></i> Matchmaking</h2>
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card-custom p-4 mb-4">
                            <h4>Buscar Partida</h4>
                            <form id="matchForm" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label">Juego</label>
                                        <select className="form-select" value={game} onChange={(e) => setGame(e.target.value)} required>
                                            <option value="">Seleccionar juego</option>
                                            <option value="ggst">Guilty Gear Strive</option>
                                            <option value="sf6">Street Fighter 6</option>
                                            <option value="tekken8">Tekken 8</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nivel</label>
                                        <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)} required>
                                            <option value="">Tu nivel</option>
                                            <option value="beginner">Principiante</option>
                                            <option value="intermediate">Intermedio</option>
                                            <option value="advanced">Avanzado</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary mt-3">
                                    <i className="fas fa-search"></i> Buscar Oponente
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card-custom p-4">
                            <h4><i className="fas fa-clock"></i> Partidas Activas</h4>
                            <div id="activeMatches"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MatchmakingSection;