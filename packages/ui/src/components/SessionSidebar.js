import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { api } from "../api";
export function SessionSidebar({ sessions, activeId, onSelect, onCreated, onDeleted }) {
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(null);
    async function handleCreate(e) {
        e.preventDefault();
        if (!newName.trim())
            return;
        setCreating(true);
        try {
            const s = await api.sessions.create(newName.trim());
            setNewName("");
            onCreated();
            onSelect(s.id);
        }
        finally {
            setCreating(false);
        }
    }
    async function handleDelete(id, e) {
        e.stopPropagation();
        setDeleting(id);
        try {
            await api.sessions.delete(id);
            onDeleted();
        }
        finally {
            setDeleting(null);
        }
    }
    return (_jsxs("aside", { className: "sidebar", children: [_jsx("h2", { children: "Sessions" }), _jsxs("form", { onSubmit: handleCreate, className: "create-form", children: [_jsx("input", { type: "text", placeholder: "New session name\u2026", value: newName, onChange: (e) => setNewName(e.target.value) }), _jsx("button", { type: "submit", disabled: creating || !newName.trim(), children: creating ? "Creating…" : "Create" })] }), _jsxs("ul", { className: "session-list", children: [sessions.map((s) => (_jsxs("li", { className: `session-item ${s.id === activeId ? "active" : ""}`, onClick: () => onSelect(s.id), children: [_jsx("span", { className: "session-name", children: s.name }), _jsx("button", { className: "delete-btn", disabled: deleting === s.id, onClick: (e) => handleDelete(s.id, e), children: "\u00D7" })] }, s.id))), sessions.length === 0 && _jsx("li", { className: "empty", children: "No sessions yet" })] })] }));
}
