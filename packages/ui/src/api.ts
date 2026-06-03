const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((err as { detail: string }).detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Session {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  snippets: Snippet[];
}

export interface Snippet {
  id: number;
  chunk_id: number;
  content: string;
  source: string;
  order: number;
  annotation: string | null;
}

export interface SearchResult {
  chunk_id: number;
  document_id: number;
  source: string;
  content: string;
  score: number;
}

export interface Draft {
  id: number;
  session_id: number;
  content: string;
  created_at: string;
}

export const api = {
  sessions: {
    list: () => req<Session[]>("GET", "/sessions"),
    create: (name: string) => req<Session>("POST", "/sessions", { name }),
    get: (id: number) => req<Session>("GET", `/sessions/${id}`),
    delete: (id: number) => req<void>("DELETE", `/sessions/${id}`),
    addSnippet: (sessionId: number, chunkId: number, annotation?: string) =>
      req<Snippet>("POST", `/sessions/${sessionId}/snippets`, { chunk_id: chunkId, annotation }),
    removeSnippet: (sessionId: number, snippetId: number) =>
      req<void>("DELETE", `/sessions/${sessionId}/snippets/${snippetId}`),
  },
  ingest: {
    url: (url: string) => req<{ document_id: number; source: string; chunk_count: number }>("POST", "/ingest/url", { url }),
    text: (content: string, title: string) =>
      req<{ document_id: number; source: string; chunk_count: number }>("POST", "/ingest/text", { content, title }),
    pdf: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${BASE}/ingest/pdf`, { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json()).detail);
      return res.json() as Promise<{ document_id: number; source: string; chunk_count: number }>;
    },
  },
  search: (query: string, limit = 10) =>
    req<{ results: SearchResult[] }>("POST", "/search", { query, limit }),
  draft: {
    generate: (sessionId: number, focus?: string) =>
      req<Draft>("POST", "/draft", { session_id: sessionId, focus }),
    list: (sessionId: number) => req<Draft[]>("GET", `/draft/${sessionId}`),
  },
};
