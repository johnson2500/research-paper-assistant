import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { api } from "../api";
export function SearchPanel({ sessionId, onSnippetAdded }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [adding, setAdding] = useState(null);
    const [added, setAdded] = useState(new Set());
    async function handleSearch(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await api.search(query);
            setResults(res.results);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Search failed");
        }
        finally {
            setLoading(false);
        }
    }
    async function handleAdd(result) {
        if (!sessionId)
            return;
        setAdding(result.chunk_id);
        try {
            await api.sessions.addSnippet(sessionId, result.chunk_id);
            setAdded((prev) => new Set(prev).add(result.chunk_id));
            onSnippetAdded();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add snippet");
        }
        finally {
            setAdding(null);
        }
    }
    return (_jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Search & Curate" }), !sessionId && _jsx("p", { className: "hint", children: "Select or create a session to add snippets." }), _jsx("form", { onSubmit: handleSearch, children: _jsxs("div", { className: "search-row", children: [_jsx("input", { type: "text", placeholder: "Enter search query\u2026", value: query, onChange: (e) => setQuery(e.target.value), required: true }), _jsx("button", { type: "submit", disabled: loading, children: loading ? "Searching…" : "Search" })] }) }), error && _jsx("p", { className: "error", children: error }), _jsx("ul", { className: "results-list", children: results.map((r) => (_jsxs("li", { className: "result-item", children: [_jsxs("div", { className: "result-meta", children: [_jsx("span", { className: "source", children: r.source }), _jsxs("span", { className: "score", children: [(r.score * 100).toFixed(1), "%"] })] }), _jsx("p", { className: "result-content", children: r.content }), sessionId && (_jsx("button", { className: "add-btn", disabled: adding === r.chunk_id || added.has(r.chunk_id), onClick: () => handleAdd(r), children: added.has(r.chunk_id) ? "Added" : adding === r.chunk_id ? "Adding…" : "+ Add to context" }))] }, r.chunk_id))) })] }));
}
