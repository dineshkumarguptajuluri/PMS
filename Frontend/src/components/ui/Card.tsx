import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('bg-bg-card rounded-xl shadow-card p-6', className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={cn('text-xl font-bold leading-none tracking-tight', className)}>
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
