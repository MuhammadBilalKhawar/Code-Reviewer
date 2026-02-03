import React from 'react';

export const Alert = ({ 
  variant = 'info', 
  title, 
  message,
  icon,
  className = '',
  onClose,
  ...props 
}) => {
  const variants = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: '⚠',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      icon: '!',
    },
    info: {
      bg: 'bg-teal-accent/10',
      border: 'border-teal-accent/30',
      text: 'text-teal-accent',
      icon: 'ℹ',
    },
  };

  const { bg, border, text, icon: defaultIcon } = variants[variant];

  return (
    <div 
      className={`${bg} ${border} border rounded-lg p-4 flex gap-3 ${className}`}
      {...props}
    >
      <span className={`text-lg ${text} flex-shrink-0`}>
        {icon || defaultIcon}
      </span>
      <div className="flex-1">
        {title && <p className={`font-semibold ${text}`}>{title}</p>}
        {message && (
          <p className="text-sm text-neon-muted mt-1">{message}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${text} hover:opacity-70 transition-opacity`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export const ErrorAlert = ({ message, onClose, className = '' }) => (
  <Alert 
    variant="error" 
    title="Error" 
    message={message}
    onClose={onClose}
    className={className}
  />
);

export const SuccessAlert = ({ message, onClose, className = '' }) => (
  <Alert 
    variant="success" 
    title="Success" 
    message={message}
    onClose={onClose}
    className={className}
  />
);

export const WarningAlert = ({ message, onClose, className = '' }) => (
  <Alert 
    variant="warning" 
    title="Warning" 
    message={message}
    onClose={onClose}
    className={className}
  />
);

export const InfoAlert = ({ message, onClose, className = '' }) => (
  <Alert 
    variant="info" 
    title="Information" 
    message={message}
    onClose={onClose}
    className={className}
  />
);

export default Alert;
