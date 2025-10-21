# 🥊 StriveForum - Comunidad de Juegos de Pelea

## 📖 Descripción

StriveForum es una aplicación web moderna (SPA) desarrollada en React con Vite, diseñada específicamente para la comunidad de juegos de pelea. La plataforma permite a los usuarios registrarse, participar en foros especializados, acceder a recursos educativos y gestionar su perfil con un dashboard personalizado.

**Características destacadas:**
- 🎮 Foros especializados en juegos de pelea (GGST, SF6)
- 🎓 Centro de aprendizaje con recursos externos
- 👤 Sistema de autenticación completo con persistencia
- 📊 Dashboard interactivo con estadísticas relevantes al foro
- 💬 Sistema completo de posts y respuestas con votaciones inteligentes
- 🛠️ Gestión de topics con creación y eliminación segura
- �‍💼 Panel de administración completo con gestión de reportes
- 🚨 Sistema de reportes para usuarios y respuestas
- 📊 Actividad de usuarios en tiempo real con datos completos
- 🔍 Filtros avanzados por fecha, tipo y estado en AdminPanel
- �📱 Diseño completamente responsivo con tema oscuro
- 🎨 Interfaz moderna con glassmorphism y animaciones suaves
- 🔒 Sistema de seguridad con confirmaciones y validaciones
- ⚡ Desarrollo rápido con Vite HMR (Hot Module Replacement)

## 🚀 Tecnologías Utilizadas

- **React 18.2.0** - Biblioteca de JavaScript para interfaces de usuario
- **Vite 5.0.8** - Herramienta de build rápida y servidor de desarrollo
- **Bootstrap 5.3.7** - Framework CSS para diseño responsivo
- **FontAwesome 6.4.0** - Iconografía moderna
- **ESLint** - Linter para mantener código limpio

## 🏗️ Estructura del Proyecto

```
StriveForum/
├── index.html                     # HTML principal (requerido por Vite en raíz)
├── vite.config.js                 # Configuración de Vite
├── package.json                   # Dependencias y scripts
├── .gitignore                     # Archivos ignorados por Git
├── dist/                          # Build de producción (generado)
├── src/
│   ├── main.jsx                   # Punto de entrada principal con Vite
│   ├── App.jsx                    # Componente raíz con routing interno
│   ├── index.css                  # Estilos globales (7000+ líneas)
│   ├── components/
│   │   ├── Navbar.jsx             # Navegación principal con menú de perfil
│   │   ├── Hero.jsx               # Página de inicio con video
│   │   ├── DashboardSection.jsx   # Dashboard con estadísticas de foro
│   │   ├── ForumsSection.jsx      # Lista de categorías con creación de topics
│   │   ├── TopicSection.jsx       # Vista de topics con gestión completa
│   │   ├── LearningSection.jsx    # Centro de aprendizaje moderno
│   │   ├── RecentActivity.jsx     # Panel de actividad reciente
│   │   ├── AdminPanel.jsx         # Panel de administración completo
│   │   ├── modals/
│   │   │   ├── LoginModal.jsx     # Modal de inicio de sesión
│   │   │   ├── RegisterModal.jsx  # Modal de registro
│   │   │   ├── CreateTopicModal.jsx # Creación de topics vacíos
│   │   │   ├── DeleteTopicModal.jsx # Eliminación segura con confirmación
│   │   │   ├── NewPostModal.jsx
│   │   │   ├── PostModal.jsx      # Modal para ver posts y respuestas
│   │   │   ├── PostThreadModal.jsx # Modal para responder posts
│   │   │   └── ReportUserModal.jsx # Modal para reportar usuarios/respuestas
│   │   └── notifications/
│   │       └── Notifications.jsx  # Sistema de notificaciones
│   ├── services/
│   │   └── api.js                 # Preparado para integración con backend
│   └── utils/
│       └── roleUtils.js           # Utilidades de roles, reportes y gestión de usuarios
├── package.json
├── package-lock.json
└── README.md
```

## ✨ Características Implementadas

### � Sistema de Autenticación y Roles
- **Registro e inicio de sesión** con validación completa
- **Sistema de roles**: admin, moderator, user
- **Persistencia de sesión** en localStorage
- **Validación de usuarios únicos** y emails válidos
- **Estados de autenticación** que controlan el acceso a funcionalidades
- **Panel de administración** exclusivo para usuarios admin
- **Control de permisos** por rol en tiempo real

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

### 💬 Sistema de Foros Avanzado
- **Categorías de temas** organizadas por juegos (GGST, SF6)
- **Creación de topics** vacíos desde ForumsSection con CreateTopicModal
- **Eliminación segura** de topics con DeleteTopicModal y confirmación "ELIMINAR"
- **Sistema de posts** y respuestas anidadas con threading completo
- **Votaciones inteligentes** con sistema de debounce (500ms) anti-spam
- **Control de votación** - solo un voto por usuario por topic/post
- **Ordenamiento avanzado** por fecha (recientes/antiguos) y popularidad
- **Sistema de reportes** integrado para posts y respuestas
- **Botones de reporte** contextuales (solo para contenido de otros usuarios)
- **Autenticación requerida** para todas las interacciones
- **Permisos de autor** - solo el creador puede eliminar sus topics
- **Persistencia completa** en localStorage con claves organizadas

### 📊 Dashboard Interactivo
- **Perfil de usuario editable** con formulario inline y validaciones
- **Estadísticas relevantes** al foro: Temas Creados, Posts, Seguidores, Reputación
- **Indicadores de tendencia** con deltas de crecimiento
- **Tarjetas de acceso rápido** contextuales según autenticación
- **Historial de actividad** dinámico con actividades del foro
- **Diseño modular** con grid responsivo y tema oscuro consistente

### 🎓 Centro de Aprendizaje
- **Selección de juegos** (Guilty Gear Strive, Street Fighter 6)
- **Recursos externos organizados** (tutoriales, combos, frame data)
- **Enlaces seguros** con `noopener,noreferrer`
- **Banner dinámico** que cambia según el juego seleccionado
- **Consejos de aprendizaje** con tips útiles

### 👨‍💼 Panel de Administración Avanzado
- **Gestión de reportes completa** con filtros por tipo, fecha y estado
- **Visualización de actividad de usuarios** con historial detallado
- **Sistema de reportes** para posts, respuestas y comportamiento
- **Filtros inteligentes** por fecha, tipo de reporte y usuario reportado
- **Interfaz moderna** con tarjetas organizadas y scroll personalizado
- **Acciones administrativas** para revisar y gestionar reportes
- **Actividad en tiempo real** con contenido expandible y timestamps
- **Cooldown system** para prevenir spam de reportes (20 minutos)
- **Tipos de reporte**: Spam, Acoso, Contenido inapropiado, Lenguaje ofensivo

### 🔧 Sistema Técnico Avanzado
- **Persistencia completa** en localStorage (sf_topics, sf_postsMap, sf_user_votes)
- **Sistema de notificaciones** toast con diferentes tipos y animaciones
- **Validaciones robustas** en tiempo real con feedback visual
- **Sistema de debounce** para prevenir spam en votaciones
- **Modales con glassmorphism** y animaciones CSS3 avanzadas
- **Tema oscuro consistente** con variables CSS y gradientes
- **Estados de carga** y progress indicators
- **Manejo de errores** completo con rollback automático
- **Código limpio** con hooks personalizados y componentes reutilizables

### 🔒 Seguridad y UX
- **Confirmaciones críticas** para acciones destructivas (eliminar topics)
- **Validación de permisos** por autor en tiempo real  
- **Anti-spam system** con limitación temporal de acciones
- **Sanitización de inputs** y validación de formularios
- **Estados UI reactivos** que reflejan permisos del usuario
- **Feedback inmediato** en todas las interacciones

## Cómo ejecutar

1. Clona el repositorio:

   ```
   git clone <repo-url>
   cd StriveForum
   ```

2. Instala dependencias:

## 🚀 Instalación y Uso

### Prerequisitos
- Node.js 16+ 
- npm o yarn

### Pasos de instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/vicebande/StriveForum.git
   cd StriveForum
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre http://localhost:3000 en tu navegador

### Comandos disponibles

- `npm run dev` - Inicia el servidor de desarrollo con HMR
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta ESLint para revisar el código

## 🛠️ Funcionalidades Técnicas Destacadas

### Sistema de Reportes y Moderación
```javascript
// Reportes de usuarios, posts y respuestas
// Cooldown de 20 minutos por usuario reportado
// Tipos de reporte: SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, OFFENSIVE_LANGUAGE, OTHER
// Estados: pending, reviewed, dismissed
// Filtros por fecha, tipo y usuario en AdminPanel
// Contenido reportado preservado para revisión
```

### Sistema de Votación Inteligente
```javascript
// Debounce de 500ms para prevenir spam
// Un solo voto por usuario por topic/post
// Rollback automático en caso de error
// Estados UI reactivos (votingInProgress)
```

### Gestión de Topics
```javascript
// Creación: Topics vacíos desde ForumsSection
// Eliminación: Solo autores + confirmación "ELIMINAR"
// Persistencia: localStorage con estructura organizada
// UI: Modales con tema oscuro y animaciones
```

### Persistencia de Datos
```javascript
// Claves localStorage:
// - sf_topics: Lista de topics
// - sf_postsMap: Posts organizados por topic con respuestas anidadas
// - sf_user_votes: Control de votaciones por usuario
// - sf_users: Usuarios registrados con roles
// - sf_reports: Sistema de reportes con timestamps y estado
// - sf_user_likes: Sistema de likes para respuestas
// - sf_auth_session: Sesión activa del usuario
// - sf_report_cooldowns: Control de cooldown para reportes
```

## 📝 Notas para Desarrolladores

### Navegación y Estado
- **Topics**: Usar `showSection('topic:<id>')` para abrir TopicSection
- **AdminPanel**: Accesible desde el menú del usuario (solo para admins)
- **Estados**: La navegación se maneja con `currentSection` en App.jsx
- **Modales**: Sistema centralizado en `/components/modals/`
- **Reportes**: Botones contextuales en posts y respuestas

### Datos y Persistencia  
- **Datos actuales**: Simulados en localStorage (desarrollo)
- **API Ready**: Estructura preparada en `src/services/api.js`
- **Migración**: Reemplazar handlers locales por llamadas HTTP cuando la API esté lista

### Seguridad y Producción
- **LocalStorage**: No guardar información sensible (tokens/passwords) en producción
- **Validaciones**: Implementadas en cliente, replicar en backend
- **Permisos**: Sistema de autorización basado en autor del contenido

### Extensibilidad
- **Nuevos endpoints**: Agregar en `src/services/api.js`
- **Nuevos modales**: Seguir patrón en `/components/modals/`
- **Nuevas secciones**: Integrar en App.jsx con sistema de navegación existente

## 🎨 Personalización de UI

El tema visual usa variables CSS y puede personalizarse fácilmente:
- **Colores principales**: Gradientes azules y púrpuras
- **Tema oscuro**: Backgrounds #2d2d2d, texto #b0b0b0
- **Animaciones**: Transiciones suaves con CSS3
- **Responsive**: Mobile-first con breakpoints estándar

## 🚀 Migración a Vite

Este proyecto ha sido migrado exitosamente de Create React App a Vite, incluyendo:

### ✅ Cambios realizados:
- **Configuración actualizada**: package.json con scripts de Vite
- **Punto de entrada**: `main.jsx` optimizado para Vite
- **HTML principal**: `index.html` movido a la raíz del proyecto
- **Imports optimizados**: Bootstrap y FontAwesome como ES modules
- **ESLint configurado**: `.eslintrc.cjs` específico para React + Vite
- **Build de producción**: Optimización automática con tree-shaking
- **Hot Module Replacement**: Desarrollo más rápido con HMR

### 🎯 Beneficios obtenidos:
- **Startup más rápido**: ~3x más rápido que CRA
- **Hot reloading**: Instantáneo con preservación de estado
- **Build optimizado**: Archivos más pequeños y carga más rápida
- **ES Modules nativos**: Mejor compatibilidad con herramientas modernas
- **TypeScript ready**: Soporte nativo sin configuración adicional