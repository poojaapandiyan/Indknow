// Placeholder API client for future Python + FastAPI + LangChain + ChromaDB + Gemini backend.
// The frontend uses local simulation today; swap these functions with real fetch calls
// pointing at the backend URLs listed below when it becomes available.
//
//   POST   /upload         -> upload a document
//   POST   /chat           -> ask a question, returns { answer, sources, related, confidence }
//   GET    /documents      -> list uploaded documents
//   GET    /document/:id   -> fetch a document's metadata + preview URL
//   DELETE /document/:id   -> remove a document from the knowledge base
//   GET    /summary/:id    -> generate/return an AI summary of a document
//   GET    /history        -> chat conversation history

export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export type UploadResponse = { id: string; status: string };
export type ChatResponse = {
  answer: string;
  confidence: number;
  sources: { docId: string; docName: string; page?: number; section?: string }[];
  related: { docId: string; docName: string }[];
  notFound?: boolean;
};

async function todo<T>(_endpoint: string): Promise<T> {
  throw new Error("Backend not connected yet. Replace with real fetch call.");
}

export const api = {
  uploadDocument: (_file: File) => todo<UploadResponse>("POST /upload"),
  chat: (_question: string, _threadId?: string) => todo<ChatResponse>("POST /chat"),
  listDocuments: () => todo<unknown[]>("GET /documents"),
  getDocument: (id: string) => todo<unknown>(`GET /document/${id}`),
  deleteDocument: (id: string) => todo<void>(`DELETE /document/${id}`),
  summarize: (id: string) => todo<{ summary: string }>(`GET /summary/${id}`),
  history: () => todo<unknown[]>("GET /history"),
};
