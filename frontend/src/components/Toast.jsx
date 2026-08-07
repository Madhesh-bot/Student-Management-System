import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// ── Toast Context ─────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

/**
 * Hook to access the toast system from any child component.
 * Usage: const { showToast } = useToast();
 *        showToast('Saved successfully', 'success');
 */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

// ── Icon components per variant ───────────────────────────────────────────────
const Icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ── Single Toast Item ─────────────────────────────────────────────────────────
const ToastItem = ({ toast, onClose }) => {
  const colors = {
    success: { bg: 'var(--success)', subtle: 'var(--success-subtle)', text: 'var(--success)' },
    error:   { bg: 'var(--danger)',  subtle: 'var(--danger-subtle)',  text: 'var(--danger)' },
    warning: { bg: 'var(--warning)', subtle: 'var(--warning-subtle)', text: 'var(--warning)' },
    info:    { bg: 'var(--info)',    subtle: 'var(--info-subtle)',    text: 'var(--info)' },
  };
  const c = colors[toast.type] || colors.info;

  return (
    <div className="toast-item" role="alert" aria-live="assertive">
      <div className="toast-icon" style={{ color: c.text }}>
        {Icons[toast.type] || Icons.info}
      </div>
      <div className="toast-body">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={(e) => { e.stopPropagation(); onClose(toast.id); }}
        aria-label="Dismiss notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {/* Progress bar */}
      <div className="toast-progress" style={{ backgroundColor: c.text }} />
    </div>
  );
};

// ── Toast Provider ─────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = null, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type, title }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="toast-container" aria-label="Notifications">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
          max-width: 380px;
          width: 100%;
        }

        .toast-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: var(--bg-panel);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 14px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
          pointer-events: all;
          animation: toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes toastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }

        .toast-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .toast-body {
          flex: 1;
          min-width: 0;
        }

        .toast-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--neutral-900);
          margin-bottom: 2px;
        }

        .toast-message {
          font-size: 0.88rem;
          color: var(--neutral-700);
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--neutral-400);
          padding: 2px;
          border-radius: 4px;
          flex-shrink: 0;
          transition: color var(--transition-fast);
        }

        .toast-close:hover {
          color: var(--neutral-700);
        }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          opacity: 0.5;
          animation: toastProgress 4s linear forwards;
          transform-origin: left;
        }

        @keyframes toastProgress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }

        @media (max-width: 480px) {
          .toast-container {
            left: 16px;
            right: 16px;
            bottom: 16px;
            max-width: 100%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
