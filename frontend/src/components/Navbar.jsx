import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Top Navbar Component with Debounced Toggle Controls
 */
const Navbar = ({ onToggleSidebar, sidebarCollapsed, currentTheme, onToggleTheme }) => {
  const currentUser = authService.getCurrentUser();
  const lastSidebarClickRef = useRef(0);
  const lastThemeClickRef = useRef(0);

  const handleSidebarToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastSidebarClickRef.current < 350) return;
    lastSidebarClickRef.current = now;
    if (onToggleSidebar) onToggleSidebar();
  };

  const handleThemeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastThemeClickRef.current < 350) return;
    lastThemeClickRef.current = now;
    if (onToggleTheme) onToggleTheme();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          type="button"
          onClick={handleSidebarToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '6px'
          }}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </button>
        
        <Link to="/" className="navbar-brand">
          <span>Student Management System</span>
        </Link>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Theme Toggle Button */}
        <button 
          type="button"
          onClick={handleThemeToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--border-radius-sm)',
            transition: 'background var(--transition-fast)'
          }}
          title="Toggle Dark/Light Mode"
        >
          {currentTheme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warning)' }}>
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {currentUser && (
          <Link to="/profile" className="user-profile-summary">
            <div className="user-avatar">
              {getInitials(currentUser.name)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="hide-on-mobile">
              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {currentUser.role}
              </span>
            </div>
          </Link>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 576px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}} />
    </header>
  );
};

export default Navbar;
