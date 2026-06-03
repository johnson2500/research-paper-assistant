import { useState, useRef } from "react";
import { api } from "../api";

interface Props {
  onIngested: () => void;
}

type Mode = "url" | "pdf" | "text";

export function IngestPanel({ onIngested }: Props) {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      let result;
      if (mode === "url") {
        result = await api.ingest.url(url);
      } else if (mode === "pdf") {
        const file = fileRef.current?.files?.[0];
        if (!file) throw new Error("No file selected");
        result = await api.ingest.pdf(file);
      } else {
        result = await api.ingest.text(textContent, textTitle || "Untitled");
      }
      setStatus(`Ingested "${result.source}" — ${result.chunk_count} chunks`);
      setUrl("");
      setTextContent("");
      setTextTitle("");
      onIngested();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingestion failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h2>Ingest Content</h2>
      <div className="tab-bar">
        {(["url", "pdf", "text"] as Mode[]).map((m) => (
          <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {mode === "url" && (
          <input
            type="url"
            placeholder="https://example.com/paper"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        )}
        {mode === "pdf" && <input type="file" accept=".pdf" ref={fileRef} required />}
        {mode === "text" && (
          <>
            <input
              type="text"
              placeholder="Title (optional)"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
            />
            <textarea
              placeholder="Paste text content here…"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={8}
              required
            />
          </>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Ingesting…" : "Ingest"}
        </button>
      </form>
      {status && <p className="success">{status}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
