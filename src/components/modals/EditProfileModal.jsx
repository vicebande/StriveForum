import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const EditProfileModal = ({ show, handleClose, user, onSave }) => {
    const [mainGame, setMainGame] = useState(user.mainGame);
    const [level, setLevel] = useState(user.level);
    const [favoriteCharacter, setFavoriteCharacter] = useState(user.favoriteCharacter);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ mainGame, level, favoriteCharacter });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title><i className="fas fa-user-edit"></i> Editar Perfil</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Juego Principal</label>
                        <select className="form-select" value={mainGame} onChange={(e) => setMainGame(e.target.value)} required>
                            <option value="ggst">Guilty Gear Strive</option>
                            <option value="sf6">Street Fighter 6</option>
                            <option value="tekken8">Tekken 8</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Nivel</label>
                        <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)} required>
                            <option value="beginner">Principiante</option>
                            <option value="intermediate">Intermedio</option>
                            <option value="advanced">Avanzado</option>
                            <option value="expert">Experto</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Personaje Favorito</label>
                        <input type="text" className="form-control" value={favoriteCharacter} onChange={(e) => setFavoriteCharacter(e.target.value)} placeholder="Ej: Sol Badguy" />
                    </div>
                    <Button type="submit" className="w-100">
                        <i className="fas fa-save"></i> Guardar Cambios
                    </Button>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default EditProfileModal;