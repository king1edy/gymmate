// src/components/ui/card.tsx
import React from 'react';

export function Card({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`bg-white shadow rounded-lg p-6 ${props.className || ''}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`mb-4 ${props.className || ''}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 {...props} className={`text-xl font-semibold ${props.className || ''}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`${props.className || ''}`}>
      {children}
    </div>
  );
} 