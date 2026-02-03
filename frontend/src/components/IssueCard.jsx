import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Grid, Flex } from './ui/Layout';
import { Badge, StatusBadge } from './ui/Badge';

export const IssueCard = ({ 
  file,
  severity,
  message,
  lineNumber,
  suggestion,
  onExpand,
  isExpanded,
  className = ''
}) => {
  const severityStyles = {
    high: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' },
    medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    low: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  };

  const { bg, border, text } = severityStyles[severity] || severityStyles.low;

  return (
    <Card className={`${bg} border-l-4 ${border} ${className}`}>
      <CardContent className="space-y-3">
        <Flex justify="between" align="start">
          <div className="flex-1">
            <Flex gap="3" align="start">
              <div className="text-sm text-neon-muted font-mono">
                {file}:{lineNumber}
              </div>
              <StatusBadge status={severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low'} />
            </Flex>
            <p className="text-sm text-neon-text mt-2 font-medium">{message}</p>
          </div>
          {onExpand && (
            <button
              onClick={onExpand}
              className="text-copper hover:text-copper/80 transition-colors text-lg"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </Flex>

        {isExpanded && suggestion && (
          <div className="mt-4 pt-4 border-t border-copper/10">
            <p className="text-xs font-semibold text-copper mb-2">💡 Suggestion</p>
            <p className="text-sm text-neon-muted">{suggestion}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const IssuesList = ({ issues, className = '' }) => {
  const [expanded, setExpanded] = React.useState(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {issues.map((issue, idx) => (
        <IssueCard
          key={idx}
          {...issue}
          isExpanded={expanded === idx}
          onExpand={() => setExpanded(expanded === idx ? null : idx)}
        />
      ))}
    </div>
  );
};

export default { IssueCard, IssuesList };
