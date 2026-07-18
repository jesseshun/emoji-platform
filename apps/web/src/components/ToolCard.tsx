interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  badge: string;
  index: string;
}

export function ToolCard({ icon, title, description, badge, index }: ToolCardProps) {
  return (
    <li className="grid gap-4 border-b border-border-subtle py-5 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:items-start">
      <div className="flex h-13 w-13 items-center justify-center rounded-[8px] border border-border bg-bg-subtle text-2xl" aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-text-muted">{index}</span>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        </div>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      <span className="w-fit rounded-full bg-warning-subtle px-2 py-1 text-xs font-medium text-warning">
        {badge}
      </span>
    </li>
  );
}
