import React from 'react';

type BadgeVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  success: `
    bg-green-500/10
    text-green-400
    border-green-500/20
  `,
  danger: `
    bg-red-500/10
    text-red-400
    border-red-500/20
  `,
  warning: `
    bg-yellow-500/10
    text-yellow-400
    border-yellow-500/20
  `,
  neutral: `
    bg-zinc-700/40
    text-zinc-300
    border-zinc-600
  `,
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
}) => {
  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-1
        rounded-full
        text-xs
        font-semibold
        border
        uppercase
        tracking-wide
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
};