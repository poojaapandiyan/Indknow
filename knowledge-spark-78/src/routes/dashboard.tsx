import { createFileRoute } from "@tanstack/react-router";
import { FileText, Cog, Wrench, ShieldCheck } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const docsByType = [
  { name: "Manuals", value: 42 },
  { name: "Reports", value: 28 },
  { name: "Safety", value: 18 },
  { name: "Inspections", value: 22 },
];

const failures = [
  { machine: "P101", count: 6 },
  { machine: "V12", count: 3 },
  { machine: "M45", count: 8 },
  { machine: "C9", count: 4 },
  { machine: "P202", count: 2 },
];

const trend = [
  { month: "Jan", uploads: 24 }, { month: "Feb", uploads: 38 }, { month: "Mar", uploads: 52 },
  { month: "Apr", uploads: 46 }, { month: "May", uploads: 68 }, { month: "Jun", uploads: 84 },
];

const recent = [
  { name: "Maintenance Report.pdf", type: "Report", date: "2026-07-14", status: "Processed" },
  { name: "Safety Manual.pdf", type: "Safety", date: "2026-07-13", status: "Processed" },
  { name: "Pump Manual.pdf", type: "Manual", date: "2026-07-12", status: "Processing" },
  { name: "Inspection Report.pdf", type: "Inspection", date: "2026-07-11", status: "Processed" },
];

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Live view of your industrial knowledge base.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Documents" value={560} icon={FileText} trend="+12% this month" />
        <StatCard label="Machines" value={48} icon={Cog} accent="primary" trend="4 added this week" />
        <StatCard label="Maintenance Reports" value={128} icon={Wrench} accent="warning" trend="3 pending review" />
        <StatCard label="Safety Documents" value={72} icon={ShieldCheck} accent="success" trend="All compliant" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Documents by Type</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={docsByType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {docsByType.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Machine Failure Frequency</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failures}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="machine" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Upload Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="uploads" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle className="text-base">Recent Uploads</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="py-3 pr-4 font-medium">Document Name</th>
                  <th className="py-3 pr-4 font-medium">Type</th>
                  <th className="py-3 pr-4 font-medium">Upload Date</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((r) => (
                  <tr key={r.name} className="hover:bg-accent/40">
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.type}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.date}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={r.status === "Processed" ? "border-[color:var(--success)]/40 text-[color:var(--success)]" : "border-[color:var(--warning)]/40 text-[color:var(--warning)]"}>
                        {r.status}
                      </Badge>
                    </td>
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
