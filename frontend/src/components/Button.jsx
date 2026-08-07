import React, { useState, useRef } from 'react';

/**
 * Enterprise Button Component with Execution Lock, Double-Click Debouncing & Ripple Effect
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  const lastClickTimeRef = useRef(0);
  const isExecutingRef = useRef(false);

  const handleClick = async (e) => {
    // 1. Prevent action if button is explicitly disabled, loading, or currently processing
    if (disabled || loading || isExecutingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 2. Strict 350ms timestamp debounce guard against double clicks
    const now = Date.now();
    if (now - lastClickTimeRef.current < 350) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    lastClickTimeRef.current = now;

    // 3. Create visual ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, id: now };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // 4. Safely execute single click callback
    if (onClick) {
      try {
        isExecutingRef.current = true;
        const result = onClick(e);
        // Handle asynchronous promises cleanly
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (err) {
        throw err;
      } finally {
        setTimeout(() => {
          isExecutingRef.current = false;
        }, 350);
      }
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="btn-ripple"
          style={{
            top: `${r.y}px`,
            left: `${r.x}px`,
            width: `${r.size}px`,
            height: `${r.size}px`,
            pointerEvents: 'none',
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.35)',
            transform: 'scale(0)',
            animation: 'btnRipple 0.6s linear'
          }}
        />
      ))}
      {loading ? (
        <>
          <span
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s infinite linear',
              marginRight: '8px',
              pointerEvents: 'none'
            }}
          />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
