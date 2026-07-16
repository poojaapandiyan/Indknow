import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  UploadCloud, FileText, X, FileSpreadsheet, FileImage, File as FileIcon, CheckCircle2,
  Search, MoreHorizontal, Eye, Download, Pencil, Trash2, Sparkles, Loader2, FileArchive, FileCode,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  addDoc, deleteDoc, renameDoc, simulateProcessing, updateDoc,
  useKnowledgeStore, type DocStatus, type KnowledgeDoc,
} from "@/lib/knowledge-store";
import { DocumentPreviewDialog, autoSummary } from "@/components/document-preview-dialog";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.xml,.md,.png,.jpg,.jpeg,.bmp,.tiff,.zip";

function iconFor(type: string) {
  const t = type.toLowerCase();
  if (["xls", "xlsx", "csv"].includes(t)) return FileSpreadsheet;
  if (["png", "jpg", "jpeg", "bmp", "tiff"].includes(t)) return FileImage;
  if (["zip"].includes(t)) return FileArchive;
  if (["json", "xml", "md"].includes(t)) return FileCode;
  return FileText;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extOf(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

function formatWhen(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const statusStyles: Record<DocStatus, string> = {
  Uploading: "bg-primary/15 text-primary",
  Reading: "bg-primary/15 text-primary",
  Extracting: "bg-primary/15 text-primary",
  Embedding: "bg-primary/15 text-primary",
  Ready: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
  Error: "bg-destructive/15 text-destructive",
};

function statusLabel(s: DocStatus) {
  if (s === "Ready") return "Ready for AI";
  if (s === "Error") return "Error";
  return `${s}…`;
}

function UploadPage() {
  const { docs } = useKnowledgeStore();
  const [drag, setDrag] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date");
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? docs.filter((d) => d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q))
      : docs;
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return b.uploadedAt - a.uploadedAt;
    });
    return sorted;
  }, [docs, query, sortBy]);

  const readyCount = docs.filter((d) => d.status === "Ready").length;
  const processingCount = docs.filter((d) => d.status !== "Ready" && d.status !== "Error").length;

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const now = Date.now();
    const toAdd: KnowledgeDoc[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: extOf(f.name),
      mime: f.type || "application/octet-stream",
      size: f.size,
      uploadedAt: now,
      status: "Uploading",
      progress: 5,
      pages: Math.max(3, Math.round(f.size / 120_000)),
    }));
    toAdd.forEach((d) => {
      addDoc(d);
      simulateProcessing(d.id);
    });
    toast.success(`${toAdd.length} document${toAdd.length > 1 ? "s" : ""} added to the knowledge base`);
  };

  const handleRename = (doc: KnowledgeDoc) => {
    const next = window.prompt("Rename document", doc.name);
    if (next && next.trim()) {
      renameDoc(doc.id, next.trim());
      toast.success("Document renamed");
    }
  };

  const handleDelete = (doc: KnowledgeDoc) => {
    if (window.confirm(`Delete "${doc.name}" from the knowledge base?`)) {
      deleteDoc(doc.id);
      toast("Document removed");
    }
  };

  const handleSummary = (doc: KnowledgeDoc) => {
    updateDoc(doc.id, { summary: autoSummary(doc) });
    toast.success("AI summary generated");
    setPreviewDoc({ ...doc, summary: autoSummary(doc) });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Knowledge Base sidebar */}
        <aside>
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Knowledge Base</h2>
                <Badge variant="secondary">{docs.length}</Badge>
              </div>
              <div className="mt-3 relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documents…"
                  className="pl-8"
                />
              </div>
              <div className="mt-4 space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                {shown.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No documents yet. Upload to build your knowledge base.
                  </p>
                )}
                {shown.map((d) => {
                  const Icon = iconFor(d.type);
                  return (
                    <button
                      key={d.id}
                      onClick={() => setPreviewDoc(d)}
                      className="w-full flex items-start gap-2 rounded-lg p-2 text-left hover:bg-accent transition-colors"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {d.type} · {formatSize(d.size)}
                        </p>
                      </div>
                      {d.status === "Ready" ? (
                        <CheckCircle2 className="h-4 w-4 text-[color:var(--success)] shrink-0" />
                      ) : d.status === "Error" ? (
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      ) : (
                        <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-accent/60 py-2">
                  <p className="text-lg font-semibold text-[color:var(--success)]">{readyCount}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ready</p>
                </div>
                <div className="rounded-lg bg-accent/60 py-2">
                  <p className="text-lg font-semibold text-primary">{processingCount}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main upload area */}
        <div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
              <p className="mt-2 text-muted-foreground">
                Ingest technical documents. New uploads add to the knowledge base — previous documents are preserved.
              </p>
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by date</SelectItem>
                <SelectItem value="name">Sort by name</SelectItem>
                <SelectItem value="type">Sort by type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card
            className={`mt-6 border-2 border-dashed transition-all ${drag ? "border-primary bg-primary/5" : "border-border"}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
          >
            <CardContent className="p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Drag & drop files here</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF · DOC · DOCX · XLS · XLSX · PPT · PPTX · TXT · CSV · JSON · XML · MD · Images · ZIP
              </p>
              <div className="mt-5">
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
                />
                <Button onClick={() => inputRef.current?.click()}>Browse Files</Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Uploading new files never removes previously uploaded documents.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-3">
            {shown.map((f) => {
              const Icon = iconFor(f.type);
              const processing = f.status !== "Ready" && f.status !== "Error";
              return (
                <Card key={f.id} className="transition-shadow hover:shadow-[var(--shadow-soft)]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.type} · {formatSize(f.size)} · {formatWhen(f.uploadedAt)}
                        </p>
                      </div>
                      <Badge className={statusStyles[f.status]}>
                        {f.status === "Ready" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {processing && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        {statusLabel(f.status)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewDoc(f)}>
                            <Eye className="mr-2 h-4 w-4" /> View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Download will be enabled with backend")}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRename(f)}>
                            <Pencil className="mr-2 h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSummary(f)}>
                            <Sparkles className="mr-2 h-4 w-4" /> Generate Summary
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(f)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(f)} aria-label="Delete">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {processing && (
                      <div className="mt-3 space-y-1">
                        <Progress value={f.progress} className="h-1.5" />
                        <p className="text-[11px] text-muted-foreground">
                          {f.status === "Uploading" && "Uploading…"}
                          {f.status === "Reading" && "Reading document…"}
                          {f.status === "Extracting" && "Extracting text…"}
                          {f.status === "Embedding" && "Generating AI embeddings…"}
                        </p>
                      </div>
                    )}
                    {f.status === "Ready" && (
                      <p className="mt-2 text-[11px] text-[color:var(--success)]">
                        Document successfully added to the AI Knowledge Base.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {docs.length === 0 && (
              <div className="rounded-xl border border-dashed py-10 text-center">
                <FileIcon className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentPreviewDialog
        doc={previewDoc}
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
      />
    </div>
  );
}
