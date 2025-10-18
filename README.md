# README de StriveForum - Comunidad de Juegos de Pelea

## Descripción general

**StriveForum** es una aplicación web diseñada para la comunidad de juegos de pelea. Proporciona una plataforma donde los jugadores pueden **conectarse, discutir estrategias y encontrar partidas**.  
La aplicación incluye **autenticación de usuarios**, **foros** para distintos juegos y **recursos de aprendizaje** para mejorar el rendimiento en el juego.

## Estructura del proyecto

El proyecto está estructurado de la siguiente manera:

```
StriveForum
├── public
│   ├── index.html          # Archivo HTML principal de la aplicación React
│   └── static
│       ├── style
│       │   └── style.css   # Estilos CSS de la aplicación
│       └── js
│           └── main.js     # Script JavaScript de precarga
├── src
│   ├── main.jsx            # Punto de entrada de la aplicación React
│   ├── App.jsx             # Componente principal de la aplicación
│   ├── index.css           # Estilos CSS globales
│   ├── components          # Contiene todos los componentes de React
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── HomeSection.jsx
│   │   ├── DashboardSection.jsx
│   │   ├── ForumsSection.jsx
│   │   ├── MatchmakingSection.jsx
│   │   ├── LearningSection.jsx
│   │   └── modals          # Contiene los componentes modales
│   │       ├── LoginModal.jsx
│   │       ├── RegisterModal.jsx
│   │       ├── CreateTopicModal.jsx
│   │       └── EditProfileModal.jsx
│   ├── hooks               # Hooks personalizados
│   │   └── useAuth.js
│   ├── services            # Funciones de servicio para las API
│   │   └── api.js
│   └── utils               # Funciones utilitarias
│       └── helpers.js
├── package.json            # Archivo de configuración de npm
├── .gitignore              # Archivo de exclusión de Git
└── README.md               # Documentación del proyecto
```

## Cómo empezar

Para comenzar a usar el proyecto, sigue estos pasos:

1. **Clonar el repositorio:**
   ```
   git clone <repository-url>
   cd StriveForum
   ```

2. **Instalar las dependencias:**
   ```
   npm install
   ```

3. **Ejecutar la aplicación:**
   ```
   npm start
   ```

La aplicación estará disponible en:  
👉 `http://localhost:3000`

## Funcionalidades

- Autenticación de usuarios (inicio de sesión y registro)
- Foros de discusión para distintos juegos de pelea
- Funcionalidad de emparejamiento (matchmaking)
- Recursos de aprendizaje, como tutoriales y guías
- Panel de usuario con estadísticas y actividad reciente

## Contribuciones

¡Las contribuciones son bienvenidas!  
Puedes enviar un **pull request** o abrir un **issue** con tus sugerencias o mejoras.

## Licencia

Este proyecto está bajo la **Licencia MIT**.  
Consulta el archivo `LICENSE` para más detalles.