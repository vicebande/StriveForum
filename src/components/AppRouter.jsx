import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { saveCurrentSection } from '../utils/storage';
import Navbar from './Navbar';
import Hero from './Hero';
import ForumsSection from './ForumsSection';
import DashboardSection from './DashboardSection';
import LearningSection from './LearningSection';
import TopicSection from './TopicSection';
import AdminPanel from './AdminPanel';
import NotFound from './NotFound';
import Notifications from './notifications/Notifications';
// Removed unused imports from roleUtils and storage

// Componente para rutas protegidas
const ProtectedRoute = ({ children, user, requireAuth = true, requireAdmin = false }) => {
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Componente principal de la aplicación con enrutamiento
const AppRouter = ({
  user,
  notifications,
  setNotifications,
  handleLogout,
  setShowLoginModal,
  setShowRegisterModal
}) => {
  // Función para navegar programáticamente
  const handleNavigate = (section, topicId = null) => {
    if (topicId) {
      // Usar navigate de react-router en lugar de guardar en localStorage
      window.history.pushState(null, '', `/topic/${topicId}`);
    } else {
      saveCurrentSection(section);
      // Navegar a la sección correspondiente
      if (section === 'forums') {
        window.history.pushState(null, '', '/forums');
      } else if (section === 'dashboard') {
        window.history.pushState(null, '', '/dashboard');
      } else if (section === 'learning') {
        window.history.pushState(null, '', '/learning');
      } else if (section === 'admin') {
        window.history.pushState(null, '', '/admin');
      }
    }
  };

  // Función para manejar notificaciones
  const handleNotify = (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta 404 sin navbar */}
        <Route path="/404" element={<NotFound />} />
        
        {/* Layout principal con navbar */}
        <Route path="/*" element={
          <div className="App">
            <Navbar 
              user={user} 
              onLogout={handleLogout}
              onShowLogin={() => setShowLoginModal && setShowLoginModal(true)}
              onShowRegister={() => setShowRegisterModal && setShowRegisterModal(true)}
            />
            
            <main className="main-content">
              <Routes>
            {/* Ruta principal - Hero accesible para todos */}
            <Route 
              path="/" 
              element={<Hero />} 
            />
            
            {/* Ruta específica para Hero - misma funcionalidad que / */}
            <Route 
              path="/hero" 
              element={<Hero />} 
            />
            
            {/* Ruta de Foros */}
            <Route 
              path="/forums" 
              element={
                <ForumsSection 
                  onNavigate={handleNavigate}
                  onNotify={handleNotify}
                  user={user}
                />
              } 
            />
            
            {/* Ruta de Dashboard - Protegida */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute user={user} requireAuth={true}>
                  <DashboardSection 
                    user={user}
                    onNavigate={handleNavigate}
                    onNotify={handleNotify}
                  />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta de Aprendizaje */}
            <Route 
              path="/learning" 
              element={
                <LearningSection 
                  user={user}
                  onNotify={handleNotify}
                />
              } 
            />
            
            {/* Ruta de Topic específico */}
            <Route 
              path="/topic/:topicId" 
              element={
                <TopicRoute 
                  user={user}
                  onNavigate={handleNavigate}
                  onNotify={handleNotify}
                />
              } 
            />
            
            {/* Ruta de Admin - Protegida para admins */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute user={user} requireAuth={true} requireAdmin={true}>
                  <AdminPanel 
                    user={user}
                    onNotify={handleNotify}
                  />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta catch-all redirige a 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>

            {/* Modales y notificaciones */}
            <Notifications 
              notifications={notifications}
              onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

// Componente separado para manejar rutas de topics
const TopicRoute = ({ user, onNotify }) => {
  
  return (
    <TopicSection 
      onNotify={onNotify}
      user={user}
    />
  );
};

export default AppRouter;