import React from 'react';

/**
 * EmptyState — Professional empty state illustration component.
 */
const EmptyState = ({
  icon = 'generic',
  title = 'Nothing here yet',
  subtitle = 'Get started by adding your first record.',
  action = null,
}) => {
  const illustrations = {
    students: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <circle cx="60" cy="42" r="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 100c0-20.987 17.013-38 38-38s38 17.013 38 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M78 54l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M84 60H72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    marks: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <rect x="34" y="24" width="52" height="72" rx="6" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="46" y1="46" x2="74" y2="46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="46" y1="58" x2="74" y2="58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="46" y1="70" x2="62" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="82" cy="86" r="14" fill="var(--bg-surface)" stroke="currentColor" strokeWidth="2.5"/>
        <path d="M77 86l3.5 3.5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    attendance: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <rect x="28" y="32" width="64" height="62" rx="6" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="28" y1="50" x2="92" y2="50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="46" y1="26" x2="46" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="74" y1="26" x2="74" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="46" cy="66" r="5" fill="currentColor" fillOpacity="0.3"/>
        <circle cx="60" cy="66" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
        <circle cx="74" cy="66" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2"/>
      </svg>
    ),
    search: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <circle cx="52" cy="52" r="24" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="70.5" y1="70.5" x2="92" y2="92" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="44" y1="52" x2="60" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="52" y1="44" x2="52" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    leaves: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <path d="M60 90s-30-20-30-42c0-18 14-26 30-18 16-8 30 0 30 18C90 70 60 90 60 90z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
        <line x1="60" y1="50" x2="60" y2="90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    reports: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <rect x="24" y="88" width="12" height="16" rx="2" fill="currentColor" fillOpacity="0.4"/>
        <rect x="42" y="72" width="12" height="32" rx="2" fill="currentColor" fillOpacity="0.5"/>
        <rect x="60" y="56" width="12" height="48" rx="2" fill="currentColor" fillOpacity="0.6"/>
        <rect x="78" y="40" width="12" height="64" rx="2" fill="currentColor" fillOpacity="0.7"/>
        <line x1="20" y1="104" x2="96" y2="104" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    timetable: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="60" y1="32" x2="60" y2="60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="60" y1="60" x2="78" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="60" cy="60" r="3" fill="currentColor"/>
      </svg>
    ),
    generic: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="currentColor" fillOpacity="0.06" />
        <rect x="28" y="36" width="64" height="52" rx="6" stroke="currentColor" strokeWidth="2.5"/>
        <line x1="44" y1="52" x2="76" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="44" y1="64" x2="76" y2="64" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="44" y1="76" x2="60" y2="76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div
      role="status"
      aria-label={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 24px',
        color: 'var(--text-secondary)',
        gap: '16px',
      }}
    >
      <div style={{ opacity: 0.6 }}>
        {illustrations[icon] || illustrations.generic}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px' }}>
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          margin: 0,
        }}>
          {subtitle}
        </p>
      </div>
      {action && (
        <button
          className="btn btn-primary"
          onClick={action.onClick}
          style={{ marginTop: '8px' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
