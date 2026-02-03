import React from 'react';

export const Card = ({ 
  children, 
  className = '',
  hoverable = true,
  gradient = false,
  noBorder = false,
  ...props 
}) => {
  const baseStyles = `
    rounded-2xl p-6 transition-all duration-300 text-neon-text
    bg-carbon-100/85 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.35)]
    ${hoverable ? 'hover:shadow-[0_16px_40px_rgba(13,255,178,0.12)] hover:-translate-y-1 hover:border-emerald-200/40' : ''}
    ${!noBorder ? 'border border-emerald-200/20' : ''}
    ${gradient ? 'bg-gradient-to-br from-carbon-100/85 to-carbon-50/85' : ''}
  `;
  
  return (
    <div className={`${baseStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`border-b border-copper/10 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-bold text-copper ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-neon-muted mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`border-t border-copper/10 pt-4 mt-4 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
