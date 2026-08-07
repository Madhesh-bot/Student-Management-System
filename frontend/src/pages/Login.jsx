import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';

/**
 * Centered Full-Screen Campus Background Enterprise Login Component
 */
const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    register_number: '',
    department: '',
    year: '1',
    section: '',
    gender: 'Male',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Redirect to dashboard if session token exists
  useEffect(() => {
    const token = localStorage.getItem('sms_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleToggleMode = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsRegistering((prev) => !prev);
    setError(null);
    setSuccess(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      register_number: '',
      department: '',
      year: '1',
      section: '',
      gender: 'Male',
      phone: '',
      address: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isRegistering && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        if (formData.role === 'student') {
          await authService.register(
            formData.name,
            formData.email,
            formData.password,
            formData.role,
            {
              register_number: formData.register_number,
              department: formData.department,
              year: formData.year,
              section: formData.section,
              gender: formData.gender,
              phone: formData.phone,
              address: formData.address
            }
          );
        } else {
          await authService.register(
            formData.name,
            formData.email,
            formData.password,
            formData.role
          );
        }
        setSuccess('Registration successful! Logging in...');
        navigate('/');
      } else {
        await authService.login(formData.email, formData.password);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-fullscreen-wrapper">
      
      {/* High-Resolution University Campus Background Image */}
      <div className="login-bg-layer" />

      {/* Dark Transparent Overlay & Floating Glow Blobs */}
      <div className="login-bg-overlay" />
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      {/* CENTERED GLASSMORPHISM LOGIN CARD */}
      <div className="login-card-centered fade-in slide-up">
        
        {/* Brand Logo & Header */}
        <div className="login-card-header">
          <div className="brand-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3B82F6' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
            </svg>
          </div>
          <h1 className="login-title">SMS Portal</h1>
          <p className="login-subtitle">
            {isRegistering 
              ? 'Create a new user account' 
              : 'Sign in to access your portal'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger slide-down" style={{ marginBottom: '20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line></svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success slide-down" style={{ marginBottom: '20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          
          {/* User Account Role Selection in Registration Mode */}
          {isRegistering && (
            <Input
              label="User Account Role"
              name="role"
              type="select"
              value={formData.role}
              onChange={handleChange}
              required
              options={[
                { value: 'staff', label: 'Staff' },
                { value: 'admin', label: 'Administrator' },
                { value: 'student', label: 'Student' }
              ]}
            />
          )}

          {/* Student Specific Fields */}
          {isRegistering && formData.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-responsive">
              <Input
                label="Register Number"
                name="register_number"
                type="text"
                placeholder="e.g. REG101"
                value={formData.register_number}
                onChange={handleChange}
                required
              />
              <Input
                label="Full Name"
                name="name"
                type="text"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                label="Department"
                name="department"
                type="text"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <Input
                label="Year"
                name="year"
                type="select"
                value={formData.year}
                onChange={handleChange}
                required
                options={[
                  { value: '1', label: '1st Year' },
                  { value: '2', label: '2nd Year' },
                  { value: '3', label: '3rd Year' },
                  { value: '4', label: '4th Year' }
                ]}
              />
              <Input
                label="Section"
                name="section"
                type="text"
                placeholder="e.g. A"
                value={formData.section}
                onChange={handleChange}
                required
              />
              <Input
                label="Gender"
                name="gender"
                type="select"
                value={formData.gender}
                onChange={handleChange}
                required
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
              />
            </div>
          )}

          {/* Non-Student Full Name Field */}
          {isRegistering && formData.role !== 'student' && (
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          {/* Primary Login Field */}
          <Input
            label={isRegistering ? 'Email Address' : 'Email or Register Number'}
            name="email"
            type="text"
            autoComplete="off"
            placeholder={isRegistering ? 'e.g. user@institution.edu' : 'e.g. user@institution.edu or REG1001'}
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password Input with Show/Hide Toggle */}
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>

          {isRegistering && (
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          {/* Remember Me & Forgot Password Links */}
          {!isRegistering && (
            <div className="login-options-row">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                className="forgot-password-link"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowForgotModal(true); }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full btn-login-submit"
            style={{ marginTop: '14px', width: '100%', padding: '14px' }}
          >
            {isRegistering ? 'Create Account' : 'Sign in to Portal'}
          </Button>
        </form>

        {/* Mode Switcher Footer */}
        <div className="mode-switch-footer">
          <span>{isRegistering ? 'Already have an active account?' : "Don't have an account yet?"}</span>
          <button
            type="button"
            className="mode-switch-btn"
            onClick={handleToggleMode}
          >
            {isRegistering ? 'Sign In' : 'Register New Account'}
          </button>
        </div>

        <div className="card-footer-branding">
          © {new Date().getFullYear()} SMS Portal • Enterprise Edition
        </div>
      </div>

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" style={{ maxWidth: '420px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Reset Credentials
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              For password reset or account recovery, please contact your institution administrator or IT support desk.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setShowForgotModal(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .login-fullscreen-wrapper {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .login-bg-layer {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url('/assets/campus_bg.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transform: scale(1.05);
          animation: bgSlowZoom 25s ease-in-out infinite alternate;
          z-index: 1;
        }

        @keyframes bgSlowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }

        .login-bg-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(180deg, rgba(2, 6, 23, 0.72) 0%, rgba(15, 23, 42, 0.84) 100%);
          z-index: 2;
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 3;
        }

        .blob-1 {
          top: -150px;
          left: -150px;
          width: 500px;
          height: 500px;
          background: rgba(37, 99, 235, 0.25);
        }

        .blob-2 {
          bottom: -150px;
          right: -150px;
          width: 450px;
          height: 450px;
          background: rgba(59, 130, 246, 0.2);
        }

        .login-card-centered {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 44px 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 30px rgba(37, 99, 235, 0.15);
          color: #F8FAFC;
          box-sizing: border-box;
          transition: max-width var(--transition-fast);
        }

        .login-card-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .brand-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          margin-bottom: 16px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .login-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 0.92rem;
          color: #94A3B8;
        }

        .password-toggle-btn {
          position: absolute;
          right: 14px;
          top: 38px;
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .password-toggle-btn:hover {
          color: #3B82F6;
        }

        .login-options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 0.88rem;
        }

        .remember-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #CBD5E1;
          cursor: pointer;
        }

        .forgot-password-link {
          background: none;
          border: none;
          color: #3B82F6;
          font-weight: 600;
          cursor: pointer;
        }

        .forgot-password-link:hover {
          text-decoration: underline;
        }

        .mode-switch-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          font-size: 0.9rem;
          color: #CBD5E1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mode-switch-btn {
          background: none;
          border: none;
          color: #3B82F6;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .mode-switch-btn:hover {
          text-decoration: underline;
        }

        .card-footer-branding {
          margin-top: 16px;
          text-align: center;
          font-size: 0.78rem;
          color: #64748B;
        }

        @media (max-width: 576px) {
          .login-fullscreen-wrapper {
            padding: 20px 16px;
          }
          .login-card-centered {
            padding: 32px 24px;
          }
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
};

export default Login;
