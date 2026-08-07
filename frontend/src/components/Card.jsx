import React from 'react';

/**
 * Reusable Card Component
 */
const Card = ({
  children,
  title,
  headerActions,
  className = '',
  ...props
}) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || headerActions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {headerActions && <div className="card-actions">{headerActions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
