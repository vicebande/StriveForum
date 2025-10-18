import React from 'react';

const LearningSection = () => {
    return (
        <section id="learningSection" className="content-section" style={{ paddingTop: 90 }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2><i className="fas fa-graduation-cap"></i> Centro de Aprendizaje</h2>
                    <select id="learningGameSelect" className="form-select" style={{ width: 'auto' }}>
                        <option value="ggst">Guilty Gear Strive</option>
                        <option value="sf6">Street Fighter 6</option>
                    </select>
                </div>
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <div className="card-custom p-4 h-100">
                            <i className="fas fa-video fa-3x text-primary mb-3"></i>
                            <h4>Tutoriales</h4>
                            <p>Videos y guías paso a paso para dominar tus personajes favoritos.</p>
                            <button className="btn btn-outline-primary" id="tutorialsBtn">Ver Tutoriales</button>
                        </div>
                    </div>
                    <div className="col-lg-4 mb-4">
                        <div className="card-custom p-4 h-100">
                            <i className="fas fa-fist-raised fa-3x text-warning mb-3"></i>
                            <h4>Lista de Comandos</h4>
                            <p>Las listas de habilidades y consejos acerca de combos para cada personaje</p>
                            <button className="btn btn-outline-primary" id="combosBtn">Ver habilidades</button>
                        </div>
                    </div>
                    <div className="col-lg-4 mb-4">
                        <div className="card-custom p-4 h-100">
                            <i className="fas fa-chart-line fa-3x text-success mb-3"></i>
                            <h4>Frame Data</h4>
                            <p>Datos técnicos completos de cada personaje para análisis profundo del juego.</p>
                            <a href="#" target="_blank" rel="noreferrer" className="btn btn-outline-primary" id="frameDataBtn">Ver datos</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LearningSection;