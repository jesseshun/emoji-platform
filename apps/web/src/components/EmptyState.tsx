interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <span className="text-5xl mb-4">{icon}</span>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 text-center max-w-md mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
