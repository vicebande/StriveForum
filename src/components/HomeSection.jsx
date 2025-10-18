import React from 'react';

const HomeSection = () => {
    return (
        <section id="homeSection" className="content-section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8">
                        <h2 className="mb-4"><i className="fas fa-fire"></i> Últimas Discusiones</h2>
                        <div id="recentTopics"></div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card-custom p-4 mb-4">
                            <h4><i className="fas fa-users"></i> Usuarios Online</h4>
                            <div id="onlineUsers"></div>
                        </div>
                        <div className="card-custom p-4">
                            <h4><i className="fas fa-trophy"></i> Top Jugadores</h4>
                            <div id="topPlayers"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeSection;