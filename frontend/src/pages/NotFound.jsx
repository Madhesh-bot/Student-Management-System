import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

/**
 * 404 Page Not Found Component
 */
const NotFound = () => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{
        fontSize: '6rem',
        fontWeight: '900',
        color: 'var(--primary)',
        lineHeight: '1',
        marginBottom: '10px'
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '800',
        color: 'var(--neutral-900)',
        marginBottom: '15px'
      }}>
        Page Not Found
      </h2>
      <p style={{
        color: 'var(--neutral-400)',
        maxWidth: '480px',
        marginBottom: '30px'
      }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link to="/">
        <Button variant="primary">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
