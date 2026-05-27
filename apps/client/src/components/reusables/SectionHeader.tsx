import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm text-zinc-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
};