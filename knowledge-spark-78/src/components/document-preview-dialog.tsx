import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sparkles, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import type { KnowledgeDoc } from "@/lib/knowledge-store";

type Props = {
  doc: KnowledgeDoc | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlight?: string;
};

export function DocumentPreviewDialog({ doc, open, onOpenChange, highlight }: Props) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const pages = doc?.pages ?? 12;
  const summary = useMemo(() => doc?.summary ?? autoSummary(doc), [doc]);

  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {doc.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <div className="rounded-lg border bg-muted/30 min-h-[380px] p-6 overflow-auto">
            <div style={{ zoom: `${zoom}%` }} className="mx-auto max-w-prose space-y-3 text-sm leading-relaxed">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Page {page} of {pages}</p>
              <h3 className="text-lg font-semibold">Section {page}. Overview</h3>
              <p>
                Placeholder preview for <span className="font-medium">{doc.name}</span>. In production the backend
                streams the rendered document page here.
              </p>
              {highlight && (
                <p>
                  Highlighted excerpt cited in the AI answer:{" "}
                  <mark className="bg-[color:var(--warning)]/40 px-1 rounded">{highlight}</mark>
                </p>
              )}
              <p className="text-muted-foreground">
                Extracted text, tables, diagrams, and images from this page will appear in this panel once the
                document processor is connected.
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs w-16 text-center">{page} / {pages}</span>
                <Button size="icon" variant="outline" onClick={() => setPage((p) => Math.min(pages, p + 1))} aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.max(50, z - 10))} aria-label="Zoom out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs w-10 text-center">{zoom}%</span>
                <Button size="icon" variant="outline" onClick={() => setZoom((z) => Math.min(200, z + 10))} aria-label="Zoom in">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">AI Summary</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{summary}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{doc.type}</Badge>
              <Badge variant="outline">{formatSize(doc.size)}</Badge>
              <Badge variant="outline">{pages} pages</Badge>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function autoSummary(doc: KnowledgeDoc | null): string {
  if (!doc) return "";
  return [
    `Document: ${doc.name}`,
    `Type: ${doc.type}`,
    `Purpose: Technical reference for industrial operations`,
    `Key topics: maintenance procedures, safety guidelines, inspections`,
    `Status: ${doc.status === "Ready" ? "Indexed and searchable by the AI assistant." : "Processing in progress."}`,
  ].join("\n");
}
