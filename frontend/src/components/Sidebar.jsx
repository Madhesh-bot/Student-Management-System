import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Modern Navigation Sidebar Component
 */
const Sidebar = ({ collapsed, onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getMenuItemClass = (path) => {
    const isExact = location.pathname === path;
    return `sidebar-item ${isExact ? 'active' : ''}`;
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 992 && onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser && currentUser.role === 'student';
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {!collapsed && (
        <div 
          className="sidebar-overlay hide-on-desktop" 
          onClick={onToggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
            <span className="logo-text">SMS Portal</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li className={getMenuItemClass('/')}>
            <NavLink to="/" title="Dashboard" onClick={handleNavClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
              <span>Dashboard</span>
            </NavLink>
          </li>

          {!isStudent && (
            <li className={getMenuItemClass('/students')}>
              <NavLink to="/students" title="Students Registry" onClick={handleNavClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Students</span>
              </NavLink>
            </li>
          )}

          <li className={getMenuItemClass('/attendance')}>
            <NavLink to="/attendance" title="Attendance" onClick={handleNavClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Attendance</span>
            </NavLink>
          </li>

          <li className={getMenuItemClass('/marks')}>
            <NavLink to="/marks" title="Marks & Evaluation" onClick={handleNavClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>Marks & Evaluation</span>
            </NavLink>
          </li>

          {!isStudent && (
            <li className={getMenuItemClass('/reports')}>
              <NavLink to="/reports" title="Reports & Analytics" onClick={handleNavClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <span>Reports</span>
              </NavLink>
            </li>
          )}

          <li className={getMenuItemClass('/leaves')}>
            <NavLink to="/leaves" title="Leave Applications" onClick={handleNavClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Leaves</span>
            </NavLink>
          </li>

          <li className={getMenuItemClass('/timetable')}>
            <NavLink to="/timetable" title="Timetables" onClick={handleNavClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Timetables</span>
            </NavLink>
          </li>

          {isAdmin && (
            <li className={getMenuItemClass('/academic')}>
              <NavLink to="/academic" title="Academic Org" onClick={handleNavClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <span>Academic Org</span>
              </NavLink>
            </li>
          )}

          <li className={getMenuItemClass('/profile')}>
            <NavLink to="/profile" title="Profile" onClick={handleNavClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-logout" onClick={handleLogout} title="Log Out">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Log Out</span>
          </div>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 993px) {
          .hide-on-desktop {
            display: none !important;
          }
          .sidebar.collapsed .logo-text,
          .sidebar.collapsed .sidebar-menu span,
          .sidebar.collapsed .sidebar-logout span {
            display: none !important;
          }
        }
      `}} />
    </>
  );
};

export default Sidebar;
