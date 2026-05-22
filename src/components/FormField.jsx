import React from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import '../styles/forms.css';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  required = false,
  maxLength,
  placeholder,
  autoComplete,
  icon: Icon,
  disabled = false,
  rows,
  className = '',
}) {
  const id = `field-${name}`;
  const hasError = Boolean(error);
  const showValid = !hasError && Boolean(value?.toString().trim());

  const InputTag = rows ? 'textarea' : 'input';
  const inputProps = {
    id,
    name,
    value: value ?? '',
    onChange,
    onBlur,
    disabled,
    maxLength,
    placeholder,
    autoComplete,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? `${id}-error` : hint ? `${id}-hint` : undefined,
    className: `form-control ${hasError ? 'invalid' : ''} ${showValid ? 'valid' : ''}`,
  };

  if (rows) {
    inputProps.rows = rows;
  } else {
    inputProps.type = type;
  }

  return (
    <div className={`form-field ${className} ${hasError ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-mark" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="form-input-wrap">
        {Icon && <Icon className="form-field-icon" aria-hidden="true" />}
        <InputTag {...inputProps} />
        {hasError && <FiAlertCircle className="field-status-icon error" aria-hidden="true" />}
        {!hasError && showValid && type !== 'password' && (
          <FiCheck className="field-status-icon success" aria-hidden="true" />
        )}
      </div>
      {hint && !hasError && (
        <p id={`${id}-hint`} className="form-hint">
          {hint}
        </p>
      )}
      {hasError && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
