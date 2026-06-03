import { useState, useEffect, useCallback } from "react";
import { api, type Session } from "./api";
import { SessionSidebar } from "./components/SessionSidebar";
import { IngestPanel } from "./components/IngestPanel";
import { SearchPanel } from "./components/SearchPanel";
import { DraftPanel } from "./components/DraftPanel";
import "./App.css";

type ActiveTab = "ingest" | "search" | "draft";

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<ActiveTab>("ingest");

  const loadSessions = useCallback(async () => {
    const list = await api.sessions.list();
    setSessions(list);
  }, []);

  const loadActiveSession = useCallback(async () => {
    if (activeSessionId == null) {
      setActiveSession(null);
      return;
    }
    const s = await api.sessions.get(activeSessionId);
    setActiveSession(s);
  }, [activeSessionId]);

  useEffect(() => { void loadSessions(); }, [loadSessions]);
  useEffect(() => { void loadActiveSession(); }, [loadActiveSession]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Research Paper Assistant</h1>
      </header>
      <div className="app-body">
        <SessionSidebar
          sessions={sessions}
          activeId={activeSessionId}
          onSelect={setActiveSessionId}
          onCreated={loadSessions}
          onDeleted={() => {
            void loadSessions();
            setActiveSessionId(null);
          }}
        />
        <main className="main-content">
          <nav className="tab-nav">
            {(["ingest", "search", "draft"] as ActiveTab[]).map((t) => (
              <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>
          {tab === "ingest" && <IngestPanel onIngested={() => {}} />}
          {tab === "search" && (
            <SearchPanel
              sessionId={activeSessionId}
              onSnippetAdded={loadActiveSession}
            />
          )}
          {tab === "draft" && (
            <DraftPanel
              sessionId={activeSessionId}
              snippets={activeSession?.snippets ?? []}
              onSnippetRemoved={loadActiveSession}
            />
          )}
        </main>
      </div>
    </div>
  );
}
