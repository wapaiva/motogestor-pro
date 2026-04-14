import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient?: "success" | "danger" | "accent";
  negative?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  gradient,
  negative,
}: StatCardProps) {
  const gradientBg =
    gradient === "success"
      ? "bg-success"
      : gradient === "danger"
        ? "bg-destructive"
        : "bg-accent";

  const gradientBgLight =
    gradient === "success"
      ? "bg-success/10"
      : gradient === "danger"
        ? "bg-destructive/10"
        : "bg-accent/10";

  const gradientText =
    gradient === "success"
      ? "text-success"
      : gradient === "danger"
        ? "text-destructive"
        : gradient === "accent"
          ? "text-accent"
          : "text-muted-foreground";

  return (
    <div className="premium-card p-4 hover-lift animate-fade-in relative overflow-hidden">
      {gradient && (
        <div
          className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 ${gradientBg}`}
        />
      )}
      <div className="flex items-center justify-between mb-2 relative">
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${gradientBgLight}`}
        >
          <Icon className={`w-4 h-4 ${gradientText}`} />
        </div>
      </div>
      <p className={`text-xl font-bold relative ${negative ? "text-destructive" : "text-card-foreground"}`}>{value}</p>
      {trend && (
        <span
          className={`text-[10px] font-semibold mt-1 inline-block ${
            trendUp ? "text-success" : "text-destructive"
          }`}
        >
          {trend}
        </span>
      )}
    </div>
  );
}
