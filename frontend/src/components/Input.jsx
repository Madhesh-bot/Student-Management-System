import React from 'react';

/**
 * Reusable Form Input Component
 */
const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  options = [], // Used for 'select' type
  className = '',
  rows = 3, // Used for 'textarea' type
  error,
  ...props
}) => {
  const inputId = `input-${name}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="form-input form-select"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="form-input"
          style={{ resize: 'vertical' }}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="form-input"
          {...props}
        />
      )}
      
      {error && (
        <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
