import { useState } from "react";
import { api, type SearchResult } from "../api";

interface Props {
  sessionId: number | null;
  onSnippetAdded: () => void;
}

export function SearchPanel({ sessionId, onSnippetAdded }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.search(query);
      setResults(res.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(result: SearchResult) {
    if (!sessionId) return;
    setAdding(result.chunk_id);
    try {
      await api.sessions.addSnippet(sessionId, result.chunk_id);
      setAdded((prev) => new Set(prev).add(result.chunk_id));
      onSnippetAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add snippet");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="panel">
      <h2>Search & Curate</h2>
      {!sessionId && <p className="hint">Select or create a session to add snippets.</p>}
      <form onSubmit={handleSearch}>
        <div className="search-row">
          <input
            type="text"
            placeholder="Enter search query…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="results-list">
        {results.map((r) => (
          <li key={r.chunk_id} className="result-item">
            <div className="result-meta">
              <span className="source">{r.source}</span>
              <span className="score">{(r.score * 100).toFixed(1)}%</span>
            </div>
            <p className="result-content">{r.content}</p>
            {sessionId && (
              <button
                className="add-btn"
                disabled={adding === r.chunk_id || added.has(r.chunk_id)}
                onClick={() => handleAdd(r)}
              >
                {added.has(r.chunk_id) ? "Added" : adding === r.chunk_id ? "Adding…" : "+ Add to context"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
