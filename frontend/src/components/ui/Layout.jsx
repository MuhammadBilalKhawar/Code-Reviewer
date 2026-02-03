import React from 'react';

export const Container = ({ children, className = '', maxWidth = '7xl', ...props }) => {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidths[maxWidth]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Section = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'py-12 px-6',
    hero: 'py-20 px-6',
    compact: 'py-6 px-4',
    padded: 'py-16 px-8',
  };

  return (
    <section className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </section>
  );
};

export const Grid = ({ 
  children, 
  columns = 3, 
  gap = 6,
  className = '',
  responsive = true,
  ...props 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
  };

  const gapSizes = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  const responsiveClass = responsive 
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:' + gridCols[columns]
    : gridCols[columns];

  return (
    <div className={`grid ${responsiveClass} ${gapSizes[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Flex = ({ 
  children, 
  direction = 'row',
  justify = 'start',
  align = 'center',
  gap = 4,
  className = '',
  ...props 
}) => {
  const directions = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const justifies = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const aligns = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const gaps = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div 
      className={`flex ${directions[direction]} ${justifies[justify]} ${aligns[align]} ${gaps[gap]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default { Container, Section, Grid, Flex };
