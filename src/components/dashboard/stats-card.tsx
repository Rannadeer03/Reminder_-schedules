interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <div className="glass p-6 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <p className="font-body text-[10px] tracking-[0.22em] uppercase font-medium text-slate-500">
          {title}
        </p>
        <div className="text-blue-400 opacity-70">{icon}</div>
      </div>
      <p className="font-display text-4xl font-semibold leading-none mb-2 text-white">
        {value}
      </p>
      {description && (
        <p className="font-body text-xs mt-1 truncate text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}
