import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import { SessionSidebar } from "./components/SessionSidebar";
import { IngestPanel } from "./components/IngestPanel";
import { SearchPanel } from "./components/SearchPanel";
import { DraftPanel } from "./components/DraftPanel";
import "./App.css";
export default function App() {
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [tab, setTab] = useState("ingest");
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
    return (_jsxs("div", { className: "app", children: [_jsx("header", { className: "app-header", children: _jsx("h1", { children: "Research Paper Assistant" }) }), _jsxs("div", { className: "app-body", children: [_jsx(SessionSidebar, { sessions: sessions, activeId: activeSessionId, onSelect: setActiveSessionId, onCreated: loadSessions, onDeleted: () => {
                            void loadSessions();
                            setActiveSessionId(null);
                        } }), _jsxs("main", { className: "main-content", children: [_jsx("nav", { className: "tab-nav", children: ["ingest", "search", "draft"].map((t) => (_jsx("button", { className: tab === t ? "active" : "", onClick: () => setTab(t), children: t.charAt(0).toUpperCase() + t.slice(1) }, t))) }), tab === "ingest" && _jsx(IngestPanel, { onIngested: () => { } }), tab === "search" && (_jsx(SearchPanel, { sessionId: activeSessionId, onSnippetAdded: loadActiveSession })), tab === "draft" && (_jsx(DraftPanel, { sessionId: activeSessionId, snippets: activeSession?.snippets ?? [], onSnippetRemoved: loadActiveSession }))] })] })] }));
}
