import React from 'react';

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold rounded-full whitespace-nowrap';
  
  const variants = {
    default: 'bg-copper/20 text-copper',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-red-500/20 text-red-400',
    info: 'bg-teal-accent/20 text-teal-accent',
    secondary: 'bg-carbon-100 text-neon-muted',
    outline: 'border border-copper/50 text-copper',
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, className = '', ...props }) => {
  const statusVariants = {
    high: { variant: 'error', label: 'High Priority', icon: '⚠️' },
    medium: { variant: 'warning', label: 'Medium', icon: '⚡' },
    low: { variant: 'info', label: 'Low', icon: 'ℹ️' },
    complete: { variant: 'success', label: 'Complete', icon: '✓' },
    pending: { variant: 'secondary', label: 'Pending', icon: '⏳' },
  };
  
  const { variant, label, icon } = statusVariants[status] || statusVariants.pending;
  
  return (
    <Badge variant={variant} className={className} {...props}>
      <span>{icon}</span>
      {label}
    </Badge>
  );
};

export default Badge;
