interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span
        className="text-5xl mb-5 opacity-80"
        role="img"
        aria-hidden="true"
      >
        {icon}
      </span>
      <h2 className="text-lg font-semibold text-text-primary mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
