interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  badge: string;
}

export function ToolCard({ icon, title, description, badge }: ToolCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
          {badge}
        </span>
      </div>
      <div className="flex flex-col items-center text-center pt-2">
        <span className="text-4xl mb-3">{icon}</span>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
