import { useState } from "react";
import { api, type Session } from "../api";

interface Props {
  sessions: Session[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onCreated: () => void;
  onDeleted: () => void;
}

export function SessionSidebar({ sessions, activeId, onSelect, onCreated, onDeleted }: Props) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const s = await api.sessions.create(newName.trim());
      setNewName("");
      onCreated();
      onSelect(s.id);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(id);
    try {
      await api.sessions.delete(id);
      onDeleted();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <aside className="sidebar">
      <h2>Sessions</h2>
      <form onSubmit={handleCreate} className="create-form">
        <input
          type="text"
          placeholder="New session name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" disabled={creating || !newName.trim()}>
          {creating ? "Creating…" : "Create"}
        </button>
      </form>
      <ul className="session-list">
        {sessions.map((s) => (
          <li
            key={s.id}
            className={`session-item ${s.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className="session-name">{s.name}</span>
            <button
              className="delete-btn"
              disabled={deleting === s.id}
              onClick={(e) => handleDelete(s.id, e)}
            >
              ×
            </button>
          </li>
        ))}
        {sessions.length === 0 && <li className="empty">No sessions yet</li>}
      </ul>
    </aside>
  );
}
