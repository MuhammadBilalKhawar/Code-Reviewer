import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`${sizes[size]} border-copper border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

export const LoadingCard = ({ className = '' }) => (
  <div className={`rounded-xl p-6 bg-carbon-50 border border-copper/20 animate-pulse ${className}`}>
    <div className="space-y-4">
      <div className="h-6 bg-carbon-100 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-carbon-100 rounded w-full" />
        <div className="h-4 bg-carbon-100 rounded w-4/5" />
      </div>
    </div>
  </div>
);

export const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${width} ${height} bg-carbon-100 rounded animate-pulse ${className}`} />
);

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <Spinner size="lg" />
    <p className="text-neon-muted text-sm">Loading...</p>
  </div>
);

export default { Spinner, LoadingCard, Skeleton, PageLoader };
