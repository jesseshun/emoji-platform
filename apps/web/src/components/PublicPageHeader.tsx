interface PublicPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
}

export function PublicPageHeader({ eyebrow, title, description, note }: PublicPageHeaderProps) {
  return (
    <header className="border-b border-border-subtle pb-8 sm:pb-10">
      <p className="mb-3 text-xs font-semibold uppercase text-accent">{eyebrow}</p>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <h1 className="max-w-3xl text-3xl font-semibold text-text-primary sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">{description}</p>
        </div>
        {note && (
          <p className="border-l-2 border-accent pl-4 text-sm leading-6 text-text-secondary">
            {note}
          </p>
        )}
      </div>
    </header>
  );
}
