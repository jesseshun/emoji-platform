export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">{description}</p>
      <div className="bg-white rounded-lg border p-8 text-center text-gray-400">
        <p className="text-5xl mb-3">🚧</p>
        <p>此功能将在后续阶段开发</p>
      </div>
    </div>
  );
}
