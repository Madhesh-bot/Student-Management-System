import React from 'react';

/**
 * Reusable Footer Component
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>&copy; {currentYear} Student Management System. All Rights Reserved. Built with clean React & Node.js architecture.</p>
    </footer>
  );
};

export default Footer;
