
# 🥊 StriveForum - Comunidad de Juegos de Pelea (Versión Octubre 2025)


## 📖 Descripción

StriveForum es una SPA moderna desarrollada en React + Vite, pensada para la comunidad de juegos de pelea. Permite registro, login, foros temáticos, recursos de aprendizaje, dashboard personalizable, panel de administración y sistema de notificaciones avanzado. Todo el flujo es reactivo, seguro y mobile-first.

**Características principales (2025):**

- Foros temáticos (GGST, SF6, Tekken, etc.) con posts, replies y votaciones
- Centro de aprendizaje con recursos y tips por juego
- Dashboard con estadísticas, accesos rápidos y actividad reciente
- Sistema de autenticación y roles (admin, user, moderator)
- Panel de administración: reportes, bloqueo, gestión de usuarios
- Notificaciones globales y sobre modales, siempre visibles
- UI/UX moderna: glassmorphism, animaciones, tema oscuro, mobile-first
- Seguridad: validaciones, confirmaciones, anti-spam, permisos granulares
- Navegación reactiva y sin recargas, con rutas protegidas


## 🚀 Tecnologías Utilizadas


- React 18.2
- Vite 5.4
- Bootstrap 5.3
- FontAwesome 6.4
- ESLint 9+ (flat config)
- CSS3 avanzado (glassmorphism, animaciones, variables)
- LocalStorage API (persistencia cliente)
- Responsive Design (mobile-first)


## 🏗️ Estructura del Proyecto (2025)

```
StriveForum/
├── index.html                # HTML principal (Vite)
├── vite.config.js            # Configuración de Vite
├── package.json              # Dependencias y scripts
├── .gitignore                # Archivos ignorados por Git
├── src/
│   ├── main.jsx              # Punto de entrada principal
│   ├── App.jsx               # Componente raíz
│   ├── index.css             # Estilos globales
│   ├── components/
│   │   ├── AdminPanel.jsx
│   │   ├── AppRouter.jsx
│   │   ├── DashboardSection.jsx
│   │   ├── ForumsSection.jsx
│   │   ├── Hero.jsx
│   │   ├── LearningSection.jsx
│   │   ├── Navbar.jsx
│   │   ├── NotFound.jsx
│   │   ├── RecentActivity.jsx
│   │   ├── TopicSection.jsx
│   │   ├── modals/
│   │   │   ├── CreateTopicModal.jsx
│   │   │   ├── DeleteTopicModal.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   ├── NewPostModal.jsx
│   │   │   ├── PostModal.jsx
│   │   │   ├── PostThreadModal.jsx
│   │   │   ├── RegisterModal.jsx
│   │   │   └── ReportUserModal.jsx
│   │   └── notifications/
│   │       └── Notifications.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   ├── roleUtils.js
│   │   ├── shareUtils.js
│   │   └── storage.js
│   └── test/
│       ├── setupTests.js
│       └── modals/
│           ├── CreateTopicModal.test.jsx
│           ├── LoginModal.test.jsx
│           └── RegisterModal.test.jsx
├── README.md
├── package-lock.json
├── .eslintrc.cjs
├── eslint.config.js
├── babel.config.js
├── jest.config.js
└── node_modules/
```


## ✨ Características Implementadas (2025)

### 🔐 Autenticación y Seguridad
- **Registro e inicio de sesión** con validación completa y mejorada
- **Login simplificado**: Eliminada validación de contraseña compleja, solo verificación de usuario registrado
- **Validación de usuarios existentes**: Solo usuarios previamente registrados pueden iniciar sesión (excepto admin)
- **Cuenta admin predeterminada**: Usuario "admin" con acceso completo sin registro previo
- **Sistema de roles avanzado**: admin, moderator, user con permisos específicos
- **Sistema de bloqueo de usuarios** con ocultación automática de contenido
- **Persistencia de sesión mejorada** en localStorage con mejor manejo de errores
- **Validación de usuarios únicos** y emails válidos con feedback en tiempo real
- **Estados de autenticación reactivos** que controlan el acceso a funcionalidades
- **Panel de administración exclusivo** para usuarios admin con gestión completa
- **Control de permisos granular** por rol en tiempo real
- **Permisos especiales admin**: Puede eliminar topics de cualquier usuario

### 🎮 Navegación y UI
- **Navegación interna optimizada** basada en `currentSection` (home, forums, learning, dashboard)
- **Navbar responsiva perfeccionada** con menú de perfil desplegable
- **Navbar móvil completamente funcional** - logo y opciones visibles en todos los dispositivos
- **Menú móvil desplegable** - todas las opciones (Inicio, Foro, Aprender, Dashboard) accesibles
- **Estados activos** y transiciones suaves con animaciones CSS3
- **Diseño mobile-first** completamente adaptativo con breakpoints optimizados
- **Sistema de notificaciones con z-index perfecto** - siempre visible sobre modales
- **Fijación de problemas de visibilidad móvil** con CSS !important para elementos críticos

### 🏠 Página Principal (Hero)
- **Video de YouTube embebido** con autoplay silenciado
- **Panel de actividad reciente** dinámico
- **Botones de acceso rápido** contextuales según autenticación
- **Sección de recursos destacados** con links a otras secciones

### 💬 Foros y Topics
- **Categorías de temas expandidas** organizadas por juegos (GGST, SF6, Tekken, etc.)
- **Creación de topics** desde ForumsSection con CreateTopicModal mejorado
- **Eliminación segura perfeccionada** - sin botón X duplicado en DeleteTopicModal
- **Permisos de eliminación admin** - administradores pueden eliminar cualquier topic
- **Sistema de posts y respuestas** con threading completo y anidado
- **Actualizaciones automáticas de UI** - nuevos posts/respuestas aparecen instantáneamente
- **Sin necesidad de refresh manual** - estado reactivo con useMemo optimizado
- **Votaciones inteligentes** con sistema de debounce (500ms) anti-spam
- **Control de votación estricto** - solo un voto por usuario por topic/post
- **Ordenamiento avanzado** por fecha (recientes/antiguos) y popularidad
- **Sistema de reportes integrado** para posts y respuestas con cooldown
- **Botones de reporte contextuales** (solo para contenido de otros usuarios)
- **Autenticación requerida** para todas las interacciones
- **Permisos granulares** - autores pueden eliminar sus topics, admins eliminan cualquiera
- **Persistencia completa optimizada** en localStorage con sincronización mejorada
- **Modal de nueva publicación rediseñado** - estética consistente con el resto de la app

### 📊 Dashboard
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

### 👨‍💼 Panel de Administración
- **Gestión de reportes completa** con filtros por tipo, fecha y estado
- **Sistema de bloqueo/desbloqueo** de usuarios con un clic
- **Ocultación automática** de contenido de usuarios bloqueados
- **Visualización de actividad de usuarios** con historial detallado
- **Sistema de reportes** para posts, respuestas y comportamiento
- **Filtros inteligentes** por fecha, tipo de reporte y usuario reportado
- **Interfaz moderna** con tarjetas organizadas y scroll personalizado
- **Acciones administrativas** para revisar y gestionar reportes
- **Actividad en tiempo real** con contenido expandible y timestamps
- **Cooldown system** para prevenir spam de reportes (20 minutos)
- **Tipos de reporte**: Spam, Acoso, Contenido inapropiado, Lenguaje ofensivo

### 🔧 Sistema Técnico y Optimización
- **Persistencia completa mejorada** en localStorage con estructura organizada y sincronización
- **Sistema de filtrado de contenido** para usuarios bloqueados con ocultación automática
- **Sistema de notificaciones perfeccionado** con z-index 999999 para máxima visibilidad
- **Notificaciones siempre visibles** - aparecen sobre todos los modales y elementos
- **Validaciones robustas** en tiempo real con feedback visual mejorado
- **Sistema de debounce optimizado** para prevenir spam en votaciones y acciones
- **Modales con glassmorphism** y animaciones CSS3 avanzadas consistentes
- **Diseño responsive perfeccionado** para dispositivos móviles con fixes específicos
- **Tema oscuro consistente** con variables CSS, gradientes y nueva paleta de colores
- **Estados de carga reactivos** y progress indicators con UX mejorada
- **Manejo de errores robusto** completo con rollback automático y mensajes claros
- **Código limpio optimizado** con hooks personalizados y componentes reutilizables
- **Actualizaciones de estado automáticas** - useMemo con dependencias optimizadas
- **Forzado de actualizaciones** con updateTrigger para cambios inmediatos de UI
- **Sistema de sincronización mejorado** entre estado de React y localStorage

### 🔒 Seguridad y UX
- **Contraseñas robustas** con validación de complejidad en tiempo real
- **Sistema de moderación** con bloqueo de usuarios y filtrado de contenido
- **Confirmaciones críticas** para acciones destructivas (eliminar topics)
- **Validación de permisos** por autor en tiempo real  
- **Anti-spam system** con limitación temporal de acciones
- **Sanitización de inputs** y validación de formularios
- **Estados UI reactivos** que reflejan permisos del usuario
- **Feedback inmediato** en todas las interacciones
- **Diseño minimalista** optimizado para móviles


## ▶️ Cómo ejecutar

1. Clona el repositorio:

   ```
   git clone <repo-url>
   cd StriveForum
   ```





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