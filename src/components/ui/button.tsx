// src/components/ui/button.tsx
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'outline'
      ? 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50'
      : 'bg-blue-600 text-white hover:bg-blue-700';
  const sizeClass =
    size === 'sm'
      ? 'px-2 py-1 text-sm'
      : size === 'lg'
      ? 'px-6 py-3 text-lg'
      : 'px-4 py-2';

  return (
    <button
      {...props}
      className={`${variantClass} ${sizeClass} rounded ${className}`}
    >
      {children}
    </button>
  );
}