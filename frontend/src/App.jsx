import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Styling system
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Leaves from './pages/Leaves';
import Timetable from './pages/Timetable';
import Academic from './pages/Academic';
import NotFound from './pages/NotFound';

/**
 * Main application shell with Stable Navigation & Smooth Page Transitions
 */
function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('sms_theme') || 'light');
  const isLoginPage = location.pathname === '/login';

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Adjust sidebar state for mobile device viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme application hook
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sms_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ToastProvider>
      <div className="app-container">
        {/* Sidebar Panel - Rendered only on protected routes */}
        {!isLoginPage && (
          <Sidebar collapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
        )}

        {/* Main content frame */}
        <div className={`main-content ${isLoginPage ? 'full-width' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
          
          {/* Navbar Panel */}
          {!isLoginPage && (
            <Navbar 
              onToggleSidebar={toggleSidebar} 
              sidebarCollapsed={sidebarCollapsed} 
              currentTheme={theme}
              onToggleTheme={toggleTheme}
            />
          )}

          {/* Page Container without key re-mounting to prevent blinking */}
          <main className="page-container">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes (Enforced via JWT guard) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/marks" element={<Marks />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/leaves" element={<Leaves />} />
                <Route path="/timetable" element={<Timetable />} />
                <Route path="/academic" element={<Academic />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer Panel */}
          {!isLoginPage && <Footer />}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .main-content.full-width {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .main-content.full-width .page-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
        `}} />
      </div>
    </ToastProvider>
  );
}

export default App;
