import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[160px]">
                {description}
              </p>
            )}
          </div>
          <div className="bg-slate-100 rounded-lg p-2.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
