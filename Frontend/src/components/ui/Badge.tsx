import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'action' | 'success' | 'warning' | 'danger';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  className,
}) => {
  const variants = {
    info: 'bg-badge-info-bg text-badge-info-text transition-colors',
    action: 'bg-badge-action-bg text-badge-action-text transition-colors',
    success: 'bg-success/10 text-success transition-colors',
    warning: 'bg-warning/10 text-warning transition-colors',
    danger: 'bg-danger/10 text-danger transition-colors',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
