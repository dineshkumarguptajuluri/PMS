import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('bg-bg-card rounded-xl shadow-card p-6 transition-colors', className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={cn('text-xl font-bold leading-none tracking-tight text-text-primary', className)}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('flex items-center mt-6', className)}>{children}</div>
);

export default Card;
