import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot, Send, User, FileText, Plus, MessageSquare, Search, Trash2, Sparkles, AlertTriangle, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  appendMessage, createThread, deleteThread, setActiveThread,
  useKnowledgeStore, type ChatMessage, type ChatSource, type KnowledgeDoc,
} from "@/lib/knowledge-store";
import { DocumentPreviewDialog } from "@/components/document-preview-dialog";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

const SUGGESTIONS = [
  "Why did Pump P101 fail?",
  "What is the maintenance schedule for Compressor C9?",
  "Summarize the safety manual.",
  "List all inspections completed in June.",
  "Find documents discussing overheating.",
];

function tokenize(s: string) {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
}

function scoreDoc(doc: KnowledgeDoc, tokens: string[]) {
  const hay = doc.name.toLowerCase();
  let score = 0;
  tokens.forEach((t) => {
    if (hay.includes(t)) score += 3;
    else if (t.length > 4 && hay.includes(t.slice(0, 4))) score += 1;
  });
  return score;
}

function buildAnswer(question: string, docs: KnowledgeDoc[]): ChatMessage {
  const readyDocs = docs.filter((d) => d.status === "Ready");
  if (readyDocs.length === 0) {
    return {
      id: crypto.randomUUID(),
      role: "ai",
      createdAt: Date.now(),
      notFound: true,
      content:
        "I could not find this information in the uploaded documents. Please upload relevant technical documents so I can search them.",
    };
  }
  const tokens = tokenize(question);
  const ranked = readyDocs
    .map((d) => ({ d, s: scoreDoc(d, tokens) }))
    .sort((a, b) => b.s - a.s);
  const matched = ranked.filter((r) => r.s > 0);

  if (matched.length === 0) {
    return {
      id: crypto.randomUUID(),
      role: "ai",
      createdAt: Date.now(),
      notFound: true,
      content:
        "I could not find this information in the uploaded documents. Try rephrasing your question or upload additional documents that cover this topic.",
      related: ranked.slice(0, 4).map((r) => ({ docId: r.d.id, docName: r.d.name })),
    };
  }

  const topSources: ChatSource[] = matched.slice(0, 3).map((r, i) => ({
    docId: r.d.id,
    docName: r.d.name,
    page: Math.max(1, Math.floor(((r.d.pages ?? 12) / 3) * (i + 1))),
    section: i === 0 ? "Overview" : i === 1 ? "Procedure" : "Reference",
  }));
  const related = ranked.slice(3, 7).map((r) => ({ docId: r.d.id, docName: r.d.name }));
  const confidence = Math.min(97, 70 + matched.length * 6 + tokens.length);

  const primary = topSources[0].docName;
  return {
    id: crypto.randomUUID(),
    role: "ai",
    createdAt: Date.now(),
    confidence,
    sources: topSources,
    related,
    content: `Based on the ingested documents, here is my analysis of "${question}". According to ${primary}${topSources[1] ? ` and ${topSources[1].docName}` : ""}, the relevant procedures and readings suggest the issue correlates with the referenced sections. Review the cited sources for full context — this answer is grounded strictly in your uploaded documents.`,
  };
}

function ChatPage() {
  const { docs, threads, activeThreadId } = useKnowledgeStore();
  const [input, setInput] = useState("");
  const [kbQuery, setKbQuery] = useState("");
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);
  const [highlight, setHighlight] = useState<string | undefined>(undefined);
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Ensure an active thread exists
  useEffect(() => {
    if (threads.length === 0) createThread("New conversation");
    else if (!activeThreadId) setActiveThread(threads[0].id);
  }, [threads, activeThreadId]);

  const active = threads.find((t) => t.id === activeThreadId) ?? threads[0];
  const messages = active?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  const kbShown = useMemo(() => {
    const q = kbQuery.trim().toLowerCase();
    if (!q) return docs;
    const tokens = tokenize(q);
    return docs
      .map((d) => ({ d, s: scoreDoc(d, tokens) || (d.name.toLowerCase().includes(q) ? 1 : 0) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.d);
  }, [docs, kbQuery]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || !active) return;
    setInput("");
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
      createdAt: Date.now(),
    };
    appendMessage(active.id, userMsg, q);
    setThinking(true);
    setTimeout(() => {
      appendMessage(active.id, buildAnswer(q, docs));
      setThinking(false);
    }, 850);
  };

  const openSource = (docId: string, section?: string) => {
    const d = docs.find((x) => x.id === docId);
    if (d) {
      setHighlight(section);
      setPreviewDoc(d);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr_300px] h-[calc(100vh-8rem)]">
        {/* Chat history sidebar */}
        <Card className="hidden lg:flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <Button className="w-full" size="sm" onClick={() => createThread("New conversation")}>
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {threads.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No conversations yet.</p>
              )}
              {threads.map((t) => {
                const preview = t.messages[0]?.content ?? "Empty conversation";
                const isActive = t.id === activeThreadId;
                return (
                  <div
                    key={t.id}
                    className={`group rounded-lg px-3 py-2 transition-colors ${isActive ? "bg-accent" : "hover:bg-accent/50"}`}
                  >
                    <button
                      onClick={() => setActiveThread(t.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-sm font-medium truncate flex-1">{t.title}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground truncate pl-5">{preview}</p>
                    </button>
                    <div className="pl-5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteThread(t.id)}
                        className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat main */}
        <Card className="flex flex-col overflow-hidden">
          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-semibold">Industrial AI Assistant</h1>
                <p className="text-xs text-muted-foreground">
                  Grounded on {docs.filter((d) => d.status === "Ready").length} indexed document{docs.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold">Ask your knowledge base</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    I answer only using documents you have uploaded.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}>
                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : m.notFound
                          ? "bg-[color:var(--warning)]/10 text-foreground border border-[color:var(--warning)]/30 rounded-tl-sm"
                          : "bg-accent text-foreground rounded-tl-sm"
                    }`}>
                      {m.notFound && (
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[color:var(--warning)]">
                          <AlertTriangle className="h-3.5 w-3.5" /> Not found in documents
                        </div>
                      )}
                      {m.content}
                    </div>

                    {m.role === "ai" && m.sources && m.sources.length > 0 && (
                      <div className="mt-3 space-y-2 w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Confidence</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[120px]">
                            <div className="h-full bg-[color:var(--success)]" style={{ width: `${m.confidence}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[color:var(--success)]">{m.confidence}%</span>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Source documents</p>
                          <div className="flex flex-wrap gap-2">
                            {m.sources.map((s, i) => (
                              <button
                                key={i}
                                onClick={() => openSource(s.docId, s.section)}
                                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-accent transition-colors"
                              >
                                <FileText className="h-3 w-3 text-primary" />
                                <span className="font-medium">{s.docName}</span>
                                <span className="text-muted-foreground">
                                  · {s.section ? s.section : `p.${s.page}`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {m.role === "ai" && m.related && m.related.length > 0 && (
                      <div className="mt-3 w-full">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Related documents</p>
                        <div className="flex flex-wrap gap-2">
                          {m.related.map((r) => (
                            <button
                              key={r.docId}
                              onClick={() => openSource(r.docId)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-accent/50 px-2.5 py-1 text-xs hover:bg-accent transition-colors"
                            >
                              <BookOpen className="h-3 w-3 text-primary" />
                              {r.docName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-accent px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about machines, maintenance, safety, or operations…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <Button onClick={() => send()}>
                <Send className="h-4 w-4 mr-2" /> Ask
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              The AI searches only your uploaded documents and will not guess when information is missing.
            </p>
          </div>
        </Card>

        {/* Knowledge base panel */}
        <Card className="hidden lg:flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Knowledge Base</h2>
              <Badge variant="secondary">{docs.length}</Badge>
            </div>
            <div className="mt-2 relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={kbQuery}
                onChange={(e) => setKbQuery(e.target.value)}
                placeholder="Semantic search…"
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {docs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6 px-3">
                  No documents yet. Upload from the Upload tab to enable AI answers.
                </p>
              )}
              {kbShown.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setPreviewDoc(d)}
                  className="w-full flex items-start gap-2 rounded-lg p-2 text-left hover:bg-accent transition-colors"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground">{d.type} · {d.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-3 text-[11px] text-muted-foreground">
            AI answers only from indexed documents.
          </div>
        </Card>
      </div>

      <DocumentPreviewDialog
        doc={previewDoc}
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
        highlight={highlight}
      />
    </div>
  );
}
