import React from 'react';

export const Input = ({ 
  label, 
  placeholder,
  type = 'text',
  error,
  success,
  className = '',
  ...props 
}) => {
  const baseStyles = `
    w-full px-4 py-2.5 rounded-lg bg-carbon-100 border transition-all duration-200
    text-neon-text placeholder-neon-muted/50
    focus:outline-none focus:ring-2 focus:ring-copper focus:border-copper
  `;

  const stateStyles = error 
    ? 'border-red-500/50 focus:ring-red-500/50' 
    : success
    ? 'border-green-500/50 focus:ring-green-500/50'
    : 'border-copper/20 hover:border-copper/40';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-copper mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`${baseStyles} ${stateStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-400 mt-1.5">{success}</p>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label, 
  placeholder,
  rows = 4,
  error,
  success,
  className = '',
  ...props 
}) => {
  const baseStyles = `
    w-full px-4 py-2.5 rounded-lg bg-carbon-100 border transition-all duration-200
    text-neon-text placeholder-neon-muted/50 resize-none
    focus:outline-none focus:ring-2 focus:ring-copper focus:border-copper
  `;

  const stateStyles = error 
    ? 'border-red-500/50 focus:ring-red-500/50' 
    : success
    ? 'border-green-500/50 focus:ring-green-500/50'
    : 'border-copper/20 hover:border-copper/40';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-copper mb-2">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className={`${baseStyles} ${stateStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-400 mt-1.5">{success}</p>
      )}
    </div>
  );
};

export const Select = ({ 
  label,
  options = [],
  error,
  success,
  className = '',
  ...props 
}) => {
  const baseStyles = `
    w-full px-4 py-2.5 rounded-lg bg-carbon-100 border transition-all duration-200
    text-neon-text
    focus:outline-none focus:ring-2 focus:ring-copper focus:border-copper
  `;

  const stateStyles = error 
    ? 'border-red-500/50 focus:ring-red-500/50' 
    : success
    ? 'border-green-500/50 focus:ring-green-500/50'
    : 'border-copper/20 hover:border-copper/40';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-copper mb-2">
          {label}
        </label>
      )}
      <select
        className={`${baseStyles} ${stateStyles} ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  );
};

export default { Input, Textarea, Select };
