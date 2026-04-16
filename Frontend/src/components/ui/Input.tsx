import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex w-full rounded-lg border border-border-subtle bg-bg-card px-3 py-2 text-sm text-text-primary transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue',
              'disabled:cursor-not-allowed disabled:bg-bg-soft disabled:text-text-muted',
              icon && 'pl-10',
              error && 'border-danger focus:ring-danger/20 focus:border-danger',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
