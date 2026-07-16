import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "primary" | "success" | "warning" | "destructive";
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
    destructive: "bg-destructive/10 text-destructive",
  }[accent];

  return (
    <Card className="group transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
            {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
