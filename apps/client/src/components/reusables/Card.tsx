import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  action,
}) => {
  return (
    <div
      className={`
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        shadow-lg
        p-5
        ${className}
      `}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-zinc-100">
              {title}
            </h2>
          )}

          {action && <div>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
};