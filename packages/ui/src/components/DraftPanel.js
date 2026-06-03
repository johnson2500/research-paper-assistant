import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { api } from "../api";
export function DraftPanel({ sessionId, snippets, onSnippetRemoved }) {
    const [focus, setFocus] = useState("");
    const [draft, setDraft] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [removing, setRemoving] = useState(null);
    async function handleGenerate(e) {
        e.preventDefault();
        if (!sessionId)
            return;
        setError(null);
        setLoading(true);
        try {
            const d = await api.draft.generate(sessionId, focus || undefined);
            setDraft(d);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Draft generation failed");
        }
        finally {
            setLoading(false);
        }
    }
    async function handleRemoveSnippet(snippetId) {
        if (!sessionId)
            return;
        setRemoving(snippetId);
        try {
            await api.sessions.removeSnippet(sessionId, snippetId);
            onSnippetRemoved();
        }
        finally {
            setRemoving(null);
        }
    }
    return (_jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Draft Report" }), !sessionId && _jsx("p", { className: "hint", children: "Select or create a session first." }), sessionId && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "context-section", children: [_jsxs("h3", { children: ["Context (", snippets.length, " snippets)"] }), snippets.length === 0 && _jsx("p", { className: "hint", children: "No snippets yet \u2014 search and add content." }), _jsx("ul", { className: "snippet-list", children: snippets.map((s) => (_jsxs("li", { className: "snippet-item", children: [_jsx("span", { className: "snippet-source", children: s.source }), _jsxs("p", { className: "snippet-content", children: [s.content.slice(0, 200), s.content.length > 200 ? "…" : ""] }), _jsx("button", { className: "remove-btn", disabled: removing === s.id, onClick: () => handleRemoveSnippet(s.id), children: removing === s.id ? "Removing…" : "Remove" })] }, s.id))) })] }), _jsxs("form", { onSubmit: handleGenerate, children: [_jsx("input", { type: "text", placeholder: "Focus (optional, e.g. 'climate impacts on agriculture')", value: focus, onChange: (e) => setFocus(e.target.value) }), _jsx("button", { type: "submit", disabled: loading || snippets.length === 0, children: loading ? "Generating…" : "Generate Draft" })] }), error && _jsx("p", { className: "error", children: error }), draft && (_jsxs("div", { className: "draft-output", children: [_jsxs("div", { className: "draft-header", children: [_jsx("h3", { children: "Draft" }), _jsx("button", { onClick: () => navigator.clipboard.writeText(draft.content), children: "Copy" })] }), _jsx("pre", { className: "draft-content", children: draft.content })] }))] }))] }));
}
