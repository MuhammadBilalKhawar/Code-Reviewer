import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-none';
  
  const variants = {
    primary: `
      bg-copper text-carbon hover:bg-copper/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5
      active:shadow-md active:translate-y-0
    `,
    secondary: `
      bg-carbon-50 text-neon-text border border-copper/30 hover:border-copper/60 hover:bg-carbon-100
      shadow-md hover:shadow-lg hover:-translate-y-0.5
    `,
    ghost: `
      bg-transparent text-copper border-2 border-copper hover:bg-copper/10 
      active:bg-copper/20
    `,
    accent: `
      bg-teal-accent text-carbon hover:bg-teal-accent/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5
    `,
    danger: `
      bg-red-500/80 text-white hover:bg-red-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5
    `,
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
