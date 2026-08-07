import React from 'react';

/**
 * SkeletonLoader — Shimmer placeholder while data is loading.
 *
 * Variants:
 *  <SkeletonLoader type="card" />          — Full metric card
 *  <SkeletonLoader type="table" rows={5} /> — Table rows
 *  <SkeletonLoader type="text" lines={3} /> — Text paragraphs
 *  <SkeletonLoader type="profile" />        — Profile avatar + text
 */
const SkeletonLoader = ({ type = 'card', rows = 5, lines = 3, count = 1 }) => {
  const Shimmer = ({ style = {}, className = '' }) => (
    <div className={`skeleton-shimmer ${className}`} style={style} aria-hidden="true" />
  );

  const CardSkeleton = () => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <Shimmer style={{ width: '56px', height: '56px', borderRadius: 'var(--border-radius-md)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Shimmer style={{ height: '28px', width: '60%', marginBottom: '8px', borderRadius: '6px' }} />
        <Shimmer style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="table-responsive">
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px' }}>
        {[25, 30, 20, 15, 10].map((w, i) => (
          <Shimmer key={i} style={{ height: '14px', width: `${w}%`, borderRadius: '4px' }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          padding: '14px 18px',
          borderBottom: i < rows - 1 ? '1px solid var(--border-color)' : 'none',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
        }}>
          {[25, 30, 20, 15, 10].map((w, j) => (
            <Shimmer key={j} style={{ height: '12px', width: `${w}%`, borderRadius: '4px' }} />
          ))}
        </div>
      ))}
    </div>
  );

  const TextSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer key={i} style={{
          height: '14px',
          width: i === lines - 1 ? '60%' : '100%',
          borderRadius: '4px',
        }} />
      ))}
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <Shimmer style={{ width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Shimmer style={{ height: '20px', width: '50%', marginBottom: '10px', borderRadius: '6px' }} />
        <Shimmer style={{ height: '14px', width: '30%', marginBottom: '8px', borderRadius: '4px' }} />
        <Shimmer style={{ height: '14px', width: '70%', borderRadius: '4px' }} />
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'table':   return <TableSkeleton />;
      case 'text':    return <TextSkeleton />;
      case 'profile': return <ProfileSkeleton />;
      default:        return <CardSkeleton />;
    }
  };

  if (count === 1) return renderSkeleton();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};

export default SkeletonLoader;
