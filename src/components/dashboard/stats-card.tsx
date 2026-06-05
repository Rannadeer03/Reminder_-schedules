interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <div
      className="p-6 border"
      style={{ background: "#FDFCFA", borderColor: "#E2DDD5" }}
    >
      <div className="flex items-start justify-between mb-4">
        <p
          className="font-body text-[10px] tracking-[0.22em] uppercase font-medium"
          style={{ color: "#A09880" }}
        >
          {title}
        </p>
        <div style={{ color: "#C9A96E", opacity: 0.7 }}>{icon}</div>
      </div>
      <p
        className="font-display text-4xl font-semibold leading-none mb-2"
        style={{ color: "#1C1914" }}
      >
        {value}
      </p>
      {description && (
        <p className="font-body text-xs mt-1 truncate" style={{ color: "#A09880" }}>
          {description}
        </p>
      )}
    </div>
  );
}
