const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
async function req(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail ?? res.statusText);
    }
    if (res.status === 204)
        return undefined;
    return res.json();
}
export const api = {
    sessions: {
        list: () => req("GET", "/sessions"),
        create: (name) => req("POST", "/sessions", { name }),
        get: (id) => req("GET", `/sessions/${id}`),
        delete: (id) => req("DELETE", `/sessions/${id}`),
        addSnippet: (sessionId, chunkId, annotation) => req("POST", `/sessions/${sessionId}/snippets`, { chunk_id: chunkId, annotation }),
        removeSnippet: (sessionId, snippetId) => req("DELETE", `/sessions/${sessionId}/snippets/${snippetId}`),
    },
    ingest: {
        url: (url) => req("POST", "/ingest/url", { url }),
        text: (content, title) => req("POST", "/ingest/text", { content, title }),
        pdf: async (file) => {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch(`${BASE}/ingest/pdf`, { method: "POST", body: form });
            if (!res.ok)
                throw new Error((await res.json()).detail);
            return res.json();
        },
    },
    search: (query, limit = 10) => req("POST", "/search", { query, limit }),
    draft: {
        generate: (sessionId, focus) => req("POST", "/draft", { session_id: sessionId, focus }),
        list: (sessionId) => req("GET", `/draft/${sessionId}`),
    },
};
