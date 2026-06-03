import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { api } from "../api";
export function IngestPanel({ onIngested }) {
    const [mode, setMode] = useState("url");
    const [url, setUrl] = useState("");
    const [textContent, setTextContent] = useState("");
    const [textTitle, setTextTitle] = useState("");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setStatus(null);
        setLoading(true);
        try {
            let result;
            if (mode === "url") {
                result = await api.ingest.url(url);
            }
            else if (mode === "pdf") {
                const file = fileRef.current?.files?.[0];
                if (!file)
                    throw new Error("No file selected");
                result = await api.ingest.pdf(file);
            }
            else {
                result = await api.ingest.text(textContent, textTitle || "Untitled");
            }
            setStatus(`Ingested "${result.source}" — ${result.chunk_count} chunks`);
            setUrl("");
            setTextContent("");
            setTextTitle("");
            onIngested();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Ingestion failed");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "panel", children: [_jsx("h2", { children: "Ingest Content" }), _jsx("div", { className: "tab-bar", children: ["url", "pdf", "text"].map((m) => (_jsx("button", { className: mode === m ? "active" : "", onClick: () => setMode(m), children: m.toUpperCase() }, m))) }), _jsxs("form", { onSubmit: handleSubmit, children: [mode === "url" && (_jsx("input", { type: "url", placeholder: "https://example.com/paper", value: url, onChange: (e) => setUrl(e.target.value), required: true })), mode === "pdf" && _jsx("input", { type: "file", accept: ".pdf", ref: fileRef, required: true }), mode === "text" && (_jsxs(_Fragment, { children: [_jsx("input", { type: "text", placeholder: "Title (optional)", value: textTitle, onChange: (e) => setTextTitle(e.target.value) }), _jsx("textarea", { placeholder: "Paste text content here\u2026", value: textContent, onChange: (e) => setTextContent(e.target.value), rows: 8, required: true })] })), _jsx("button", { type: "submit", disabled: loading, children: loading ? "Ingesting…" : "Ingest" })] }), status && _jsx("p", { className: "success", children: status }), error && _jsx("p", { className: "error", children: error })] }));
}
