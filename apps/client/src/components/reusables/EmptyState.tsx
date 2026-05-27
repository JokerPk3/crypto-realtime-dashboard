import React from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-center
        py-10
        text-sm
        text-zinc-500
      "
    >
      {message}
    </div>
  );
};