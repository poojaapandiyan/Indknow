// Knowledge base + chat history store (localStorage-backed, client-only).
// Prepared for backend integration — see api-client.ts for placeholder endpoints.
import { useCallback, useEffect, useSyncExternalStore } from "react";

export type DocStatus = "Uploading" | "Reading" | "Extracting" | "Embedding" | "Ready" | "Error";

export type KnowledgeDoc = {
  id: string;
  name: string;
  type: string; // extension, uppercase
  mime: string;
  size: number;
  uploadedAt: number; // epoch ms
  status: DocStatus;
  progress: number; // 0..100
  pages?: number;
  summary?: string;
};

export type ChatSource = {
  docId: string;
  docName: string;
  page?: number;
  section?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: ChatSource[];
  related?: { docId: string; docName: string }[];
  confidence?: number;
  notFound?: boolean;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

type State = {
  docs: KnowledgeDoc[];
  threads: ChatThread[];
  activeThreadId: string | null;
};

const KEY = "iki_store_v1";

const defaultState = (): State => ({
  docs: [],
  threads: [],
  activeThreadId: null,
});

let state: State = defaultState();
const listeners = new Set<() => void>();
let hydrated = false;

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  hydrated = true;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  if (!hydrated) load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const serverSnapshot: State = defaultState();

export function useKnowledgeStore(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
}

// --- doc mutations ---
export function addDoc(doc: KnowledgeDoc) {
  setState((s) => ({ ...s, docs: [doc, ...s.docs] }));
}

export function updateDoc(id: string, patch: Partial<KnowledgeDoc>) {
  setState((s) => ({
    ...s,
    docs: s.docs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
  }));
}

export function deleteDoc(id: string) {
  setState((s) => ({ ...s, docs: s.docs.filter((d) => d.id !== id) }));
}

export function renameDoc(id: string, name: string) {
  updateDoc(id, { name });
}

// Simulated processing pipeline (replace with real POST /upload later)
export function simulateProcessing(id: string) {
  const stages: { status: DocStatus; progress: number; delay: number }[] = [
    { status: "Reading", progress: 25, delay: 500 },
    { status: "Extracting", progress: 55, delay: 800 },
    { status: "Embedding", progress: 85, delay: 900 },
    { status: "Ready", progress: 100, delay: 500 },
  ];
  let acc = 0;
  stages.forEach((st) => {
    acc += st.delay;
    setTimeout(() => updateDoc(id, { status: st.status, progress: st.progress }), acc);
  });
}

// --- thread mutations ---
export function createThread(title = "New conversation"): string {
  const id = crypto.randomUUID();
  setState((s) => ({
    ...s,
    threads: [{ id, title, messages: [], updatedAt: Date.now() }, ...s.threads],
    activeThreadId: id,
  }));
  return id;
}

export function setActiveThread(id: string) {
  setState((s) => ({ ...s, activeThreadId: id }));
}

export function deleteThread(id: string) {
  setState((s) => {
    const threads = s.threads.filter((t) => t.id !== id);
    return {
      ...s,
      threads,
      activeThreadId: s.activeThreadId === id ? threads[0]?.id ?? null : s.activeThreadId,
    };
  });
}

export function appendMessage(threadId: string, message: ChatMessage, titleHint?: string) {
  setState((s) => ({
    ...s,
    threads: s.threads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            messages: [...t.messages, message],
            updatedAt: Date.now(),
            title: t.messages.length === 0 && titleHint ? titleHint.slice(0, 60) : t.title,
          }
        : t,
    ),
  }));
}

// Hydration guard for consumers that need window-only values
export function useHydrated() {
  const s = useKnowledgeStore();
  useEffect(() => {}, [s]);
  return hydrated;
}

// Helper to get a stable callback bag
export function useKnowledgeActions() {
  return {
    addDoc: useCallback(addDoc, []),
    updateDoc: useCallback(updateDoc, []),
    deleteDoc: useCallback(deleteDoc, []),
    renameDoc: useCallback(renameDoc, []),
    simulateProcessing: useCallback(simulateProcessing, []),
    createThread: useCallback(createThread, []),
    setActiveThread: useCallback(setActiveThread, []),
    deleteThread: useCallback(deleteThread, []),
    appendMessage: useCallback(appendMessage, []),
  };
}
