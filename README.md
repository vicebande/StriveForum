# 🥊 StriveForum - Comunidad de Juegos de Pelea

## 📖 Descripción

StriveForum es una aplicación web moderna (SPA) desarrollada en React, diseñada específicamente para la comunidad de juegos de pelea. La plataforma permite a los usuarios registrarse, participar en foros especializados, acceder a recursos educativos y gestionar su perfil con un dashboard personalizado.

**Características destacadas:**
- 🎮 Foros especializados en juegos de pelea (GGST, SF6)
- 🎓 Centro de aprendizaje con recursos externos
- 👤 Sistema de autenticación completo con persistencia
- 📊 Dashboard interactivo con estadísticas y perfil editable
- 💬 Sistema de posts y respuestas con votaciones
- 📱 Diseño completamente responsivo
- 🎨 Interfaz moderna con tema oscuro y efectos visuales

## 🏗️ Estructura del Proyecto (Actualizada)

```
StriveForum/
├── public/
│   ├── index.html
│   └── static/
│       ├── js/main.js
│       └── style/style.css
├── src/
│   ├── index.js                    # Punto de entrada principal
│   ├── main.jsx                   # Punto de entrada alternativo
│   ├── App.jsx                    # Componente raíz con routing interno
│   ├── index.css                  # Estilos globales (7000+ líneas)
│   ├── components/
│   │   ├── Navbar.jsx             # Navegación principal con menú de perfil
│   │   ├── Hero.jsx               # Página de inicio con video
│   │   ├── DashboardSection.jsx   # Dashboard con perfil editable
│   │   ├── ForumsSection.jsx      # Lista de categorías del foro
│   │   ├── TopicSection.jsx       # Vista de topics con sistema de posts
│   │   ├── LearningSection.jsx    # Centro de aprendizaje moderno
│   │   ├── RecentActivity.jsx     # Panel de actividad reciente
│   │   ├── modals/
│   │   │   ├── LoginModal.jsx     # Modal de inicio de sesión
│   │   │   ├── RegisterModal.jsx  # Modal de registro
│   │   │   ├── CreateTopicModal.jsx
│   │   │   ├── NewPostModal.jsx
│   │   │   ├── PostModal.jsx      # Modal para ver posts y respuestas
│   │   │   └── PostThreadModal.jsx # Modal para responder posts
│   │   └── notifications/
│   │       └── Notifications.jsx  # Sistema de notificaciones
│   └── services/
│       └── api.js                 # Preparado para integración con backend
├── package.json
├── package-lock.json
└── README.md
```

## ✨ Características Implementadas

### 🔐 Sistema de Autenticación
- **Registro e inicio de sesión** con validación completa
- **Persistencia de sesión** en localStorage
- **Validación de usuarios únicos** y emails válidos
- **Estados de autenticación** que controlan el acceso a funcionalidades

### 🎮 Navegación y UI
- **Navegación interna** basada en `currentSection` (home, forums, learning, dashboard)
- **Navbar responsiva** con menú de perfil desplegable
- **Estados activos** y transiciones suaves
- **Diseño mobile-first** completamente adaptativo

### 🏠 Página Principal (Hero)
- **Video de YouTube embebido** con autoplay silenciado
- **Panel de actividad reciente** dinámico
- **Botones de acceso rápido** contextuales según autenticación
- **Sección de recursos destacados** con links a otras secciones

### 💬 Sistema de Foros
- **Categorías de temas** organizadas por juegos
- **Sistema completo de posts** y respuestas anidadas
- **Votaciones con likes/dislikes** persistentes en localStorage
- **Ordenamiento avanzado** por fecha (recientes/antiguos) y popularidad
- **Autenticación requerida** para todas las interacciones
- **Modales mejorados** para crear topics, posts y responder

### 📊 Dashboard Interactivo
- **Perfil de usuario editable** con formulario inline
- **Estadísticas simuladas** con indicadores de tendencia
- **Tarjetas de acceso rápido** a diferentes secciones
- **Historial de actividad** personalizado
- **Diseño modular** con grid responsivo

### 🎓 Centro de Aprendizaje
- **Selección de juegos** (Guilty Gear Strive, Street Fighter 6)
- **Recursos externos organizados** (tutoriales, combos, frame data)
- **Enlaces seguros** con `noopener,noreferrer`
- **Banner dinámico** que cambia según el juego seleccionado
- **Consejos de aprendizaje** con tips útiles

### 🔧 Sistema Técnico
- **Persistencia completa** en localStorage con claves organizadas
- **Sistema de notificaciones** toast con diferentes tipos
- **Validaciones robustas** en todos los formularios  
- **Manejo de errores** y estados de carga
- **Código limpio** sin dependencias no utilizadas

## Cómo ejecutar

1. Clona el repositorio:

   ```
   git clone <repo-url>
   cd StriveForum
   ```

2. Instala dependencias:

   ```
   npm install
   ```

3. Inicia la app (desarrollo):

   ```
   npm start
   ```

4. Abre http://localhost:3000

## Notas para desarrolladores

- Navegación por topics: llamar showSection('topic:<id>') para abrir TopicSection.
- Los datos actuales de topics/posts son locales (fakes). Sustituir en TopicSection y servicios/api.js por llamadas reales a la API cuando esté disponible.
- Modales y validaciones están en src/components/modals. Si vas a usar react-bootstrap instala la dependencia; actualmente los componentes son independientes.
- LocalStorage: evita guardar información sensible (contraseñas/tokens) en producción.
- Para añadir endpoints, usa src/services/api.js y actualiza los handlers en TopicSection/ForumsSection.