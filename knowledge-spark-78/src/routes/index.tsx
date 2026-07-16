import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Upload, MessageSquare, Wrench, Search, BarChart3, FileText,
  ArrowRight, FileUp, BrainCircuit, MessagesSquare, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Home,
});

const features = [
  { icon: Upload, title: "Multi-format Document Upload", desc: "PDF, DOCX, XLSX, images — ingest any technical document." },
  { icon: MessageSquare, title: "AI Chat Assistant", desc: "Ask natural-language questions across your entire library." },
  { icon: Wrench, title: "Equipment History", desc: "Track machines, maintenance, inspections and failures." },
  { icon: Search, title: "Smart Semantic Search", desc: "Meaning-based search across manuals and reports." },
  { icon: BarChart3, title: "Maintenance Analytics", desc: "Visualize failure frequency, uptime and document trends." },
  { icon: FileText, title: "AI Document Summaries", desc: "Auto-generated summaries for every uploaded document." },
];

const steps = [
  { icon: FileUp, title: "Upload Documents", desc: "Drop manuals, reports and inspections." },
  { icon: BrainCircuit, title: "AI Processes Documents", desc: "Indexed and understood semantically." },
  { icon: MessagesSquare, title: "Ask Questions", desc: "Query in natural language, any time." },
  { icon: Sparkles, title: "Answers with Sources", desc: "Grounded responses with page citations." },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Unified Asset & Operations Brain
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Industrial Knowledge <span className="text-primary">Intelligence</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-muted-foreground">
            AI-powered assistant for industrial documents, maintenance history, equipment knowledge, and operational intelligence.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/upload"><Upload className="mr-2 h-4 w-4" /> Upload Documents</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/chat"><MessageSquare className="mr-2 h-4 w-4" /> Start Chatting</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">Everything your operations team needs</h2>
          <p className="mt-3 text-muted-foreground">Purpose-built for industrial knowledge workflows.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card/40 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">From raw documents to grounded answers in four steps.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Step {i + 1}</div>
                    <h3 className="mt-1 font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 h-5 w-5 text-primary/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
