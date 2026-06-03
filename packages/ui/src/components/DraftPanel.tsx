import { useState } from "react";
import { api, type Draft, type Snippet } from "../api";

interface Props {
  sessionId: number | null;
  snippets: Snippet[];
  onSnippetRemoved: () => void;
}

export function DraftPanel({ sessionId, snippets, onSnippetRemoved }: Props) {
  const [focus, setFocus] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId) return;
    setError(null);
    setLoading(true);
    try {
      const d = await api.draft.generate(sessionId, focus || undefined);
      setDraft(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveSnippet(snippetId: number) {
    if (!sessionId) return;
    setRemoving(snippetId);
    try {
      await api.sessions.removeSnippet(sessionId, snippetId);
      onSnippetRemoved();
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="panel">
      <h2>Draft Report</h2>
      {!sessionId && <p className="hint">Select or create a session first.</p>}
      {sessionId && (
        <>
          <div className="context-section">
            <h3>Context ({snippets.length} snippets)</h3>
            {snippets.length === 0 && <p className="hint">No snippets yet — search and add content.</p>}
            <ul className="snippet-list">
              {snippets.map((s) => (
                <li key={s.id} className="snippet-item">
                  <span className="snippet-source">{s.source}</span>
                  <p className="snippet-content">{s.content.slice(0, 200)}{s.content.length > 200 ? "…" : ""}</p>
                  <button
                    className="remove-btn"
                    disabled={removing === s.id}
                    onClick={() => handleRemoveSnippet(s.id)}
                  >
                    {removing === s.id ? "Removing…" : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleGenerate}>
            <input
              type="text"
              placeholder="Focus (optional, e.g. 'climate impacts on agriculture')"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            />
            <button type="submit" disabled={loading || snippets.length === 0}>
              {loading ? "Generating…" : "Generate Draft"}
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          {draft && (
            <div className="draft-output">
              <div className="draft-header">
                <h3>Draft</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(draft.content)}
                >
                  Copy
                </button>
              </div>
              <pre className="draft-content">{draft.content}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
