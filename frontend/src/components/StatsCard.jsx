import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Flex, Grid } from './ui/Layout';

export const StatCard = ({ 
  icon, 
  label, 
  value, 
  trend,
  trendLabel,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: {
      bg: 'from-carbon-50 to-carbon-100',
      accent: 'text-copper',
      icon: 'bg-copper/10 text-copper',
    },
    success: {
      bg: 'from-green-500/5 to-green-400/5',
      accent: 'text-green-400',
      icon: 'bg-green-500/10 text-green-400',
    },
    warning: {
      bg: 'from-amber-500/5 to-amber-400/5',
      accent: 'text-amber-400',
      icon: 'bg-amber-500/10 text-amber-400',
    },
    error: {
      bg: 'from-red-500/5 to-red-400/5',
      accent: 'text-red-400',
      icon: 'bg-red-500/10 text-red-400',
    },
  };

  const { bg, accent, icon: iconBg } = variants[variant];
  const isPositive = trend && trend > 0;

  return (
    <Card gradient className={`bg-gradient-to-br ${bg} ${className}`}>
      <CardContent className="space-y-4">
        <Flex justify="between" align="start">
          <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center text-xl`}>
            {icon}
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </Flex>

        <div>
          <p className="text-sm text-neon-muted font-medium">{label}</p>
          <h3 className={`text-3xl font-bold ${accent} mt-1`}>{value}</h3>
          {trendLabel && (
            <p className="text-xs text-neon-muted mt-2">{trendLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const StatsGrid = ({ stats, className = '' }) => (
  <Grid columns={4} gap={6} className={className}>
    {stats.map((stat, idx) => (
      <StatCard key={idx} {...stat} />
    ))}
  </Grid>
);

export const MetricCard = ({ title, value, unit, description, className = '' }) => (
  <Card className={className}>
    <div className="space-y-2">
      <p className="text-sm text-neon-muted font-semibold">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-copper">{value}</span>
        {unit && <span className="text-sm text-neon-muted">{unit}</span>}
      </div>
      {description && (
        <p className="text-xs text-neon-muted mt-2">{description}</p>
      )}
    </div>
  </Card>
);

export default { StatCard, StatsGrid, MetricCard };
