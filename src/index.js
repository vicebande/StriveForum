import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // crea este archivo si no existe
// añadido: FontAwesome (asegúrate de haber instalado @fortawesome/fontawesome-free)
import '@fortawesome/fontawesome-free/css/all.min.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root no encontrado. Asegura public/index.html contiene <div id="root"></div>');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);