import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Cog, MapPin, Factory, Calendar, CheckCircle2, Wrench, AlertTriangle, ClipboardCheck, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/equipment")({
  component: EquipmentPage,
});

const equipment = {
  name: "Pump P101",
  id: "MC-P101-2019",
  department: "Process Line A",
  status: "Operational",
  manufacturer: "HydroCore Industries",
  installed: "2019-03-14",
  schedule: "Every 90 days",
};

const timeline = [
  { icon: PlugZap, label: "Installed", date: "2019-03-14", color: "primary" },
  { icon: Wrench, label: "Maintenance", date: "2023-11-02", color: "primary" },
  { icon: ClipboardCheck, label: "Inspection", date: "2024-05-10", color: "success" },
  { icon: Wrench, label: "Repair", date: "2025-02-18", color: "warning" },
  { icon: AlertTriangle, label: "Failure", date: "2026-04-06", color: "destructive" },
] as const;

const history = [
  { date: "2026-04-06", type: "Failure", technician: "R. Kumar", notes: "Bearing overheating; replaced." },
  { date: "2025-11-20", type: "Maintenance", technician: "A. Singh", notes: "Lubrication cycle, seal check." },
  { date: "2025-02-18", type: "Repair", technician: "M. Ravi", notes: "Impeller alignment corrected." },
  { date: "2024-05-10", type: "Inspection", technician: "D. Iyer", notes: "Vibration within nominal range." },
];

const colorMap = {
  primary: "bg-primary/10 text-primary border-primary/30",
  success: "bg-[color:var(--success)]/15 text-[color:var(--success)] border-[color:var(--success)]/30",
  warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-[color:var(--warning)]/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
};

function EquipmentPage() {
  const [q, setQ] = useState("");
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
      <p className="mt-2 text-muted-foreground">Search machines and view their operational history.</p>

      <div className="mt-6 flex gap-2 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by machine name or ID…" className="pl-9" />
        </div>
        <Button>Search</Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Cog className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">{equipment.name}</h2>
            <p className="text-sm text-muted-foreground">{equipment.id}</p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Department:</span> <span className="font-medium">{equipment.department}</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" /><span className="text-muted-foreground">Status:</span> <Badge className="bg-[color:var(--success)]/15 text-[color:var(--success)] hover:bg-[color:var(--success)]/20">{equipment.status}</Badge></div>
              <div className="flex items-center gap-2"><Factory className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Manufacturer:</span> <span className="font-medium">{equipment.manufacturer}</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Installed:</span> <span className="font-medium">{equipment.installed}</span></div>
              <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Maintenance:</span> <span className="font-medium">{equipment.schedule}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Lifecycle Timeline</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative border-l ml-3 space-y-6">
              {timeline.map((t) => (
                <li key={t.label} className="ml-6">
                  <span className={`absolute -left-[13px] flex h-6 w-6 items-center justify-center rounded-full border ${colorMap[t.color]}`}>
                    <t.icon className="h-3 w-3" />
                  </span>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-medium">{t.label}</p>
                    <span className="text-xs text-muted-foreground">{t.date}</span>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Maintenance History</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Technician</th>
                  <th className="py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((r) => (
                  <tr key={r.date} className="hover:bg-accent/40">
                    <td className="py-3 pr-4 text-muted-foreground">{r.date}</td>
                    <td className="py-3 pr-4"><Badge variant="outline">{r.type}</Badge></td>
                    <td className="py-3 pr-4">{r.technician}</td>
                    <td className="py-3 text-muted-foreground">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
