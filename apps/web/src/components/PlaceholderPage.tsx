interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg border p-8 text-center">
        <h1 className="text-2xl font-bold mb-3">{title}</h1>
        <p className="text-gray-500">{description}</p>
        <div className="mt-6 text-sm text-gray-400">
          此页面将在后续阶段开发。
        </div>
      </div>
    </div>
  );
}
