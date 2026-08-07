import React, { useEffect, useRef } from 'react';

/**
 * ConfirmDialog — Professional confirmation modal with Single-Execution Guard.
 */
const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const isExecutingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isExecutingRef.current = false;
    }
  }, [isOpen]);

  const handleConfirm = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    if (onCancel) {
      onCancel();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        handleCancel(e);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const variantColors = {
    danger:  { icon: 'var(--danger)', btnClass: 'btn btn-danger' },
    warning: { icon: 'var(--warning)', btnClass: 'btn btn-warning' },
    primary: { icon: 'var(--primary)', btnClass: 'btn btn-primary' },
  };
  const vc = variantColors[variant] || variantColors.danger;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(e); }}
    >
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 24px 16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: `${vc.icon}1A`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: vc.icon,
          }}>
            {variant === 'danger' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          <h2 id="confirm-dialog-title" style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            {title}
          </h2>
          <p id="confirm-dialog-message" style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
          }}>
            {message}
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px', paddingBottom: '24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            style={{ minWidth: '100px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={vc.btnClass}
            onClick={handleConfirm}
            style={{ minWidth: '100px' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
