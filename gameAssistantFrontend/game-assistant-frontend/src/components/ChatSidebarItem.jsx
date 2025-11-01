import React from "react";

import "../css/ChatPage.css";
import "../css/ChatSidebarItem.css";

export default function ChatSidebarItem({ session, active, onSelect, onDelete }) {
    const time = session.lastUseTime || session.createdAt || new Date().toISOString();
    return (
        <div
            className={`chat-session-item ${active ? "active" : ""}`}
            onClick={() => onSelect(session)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(session)}
        >
            <div style={{ minWidth: 0, overflow: "hidden" }}>
                <div className="session-title">
                    {session._loading ? <span className="shimmer-title">Загрузка…</span> : session.title}
                </div>
                <div className="session-meta">
                    {session.gameTitle ? `${session.gameTitle} • ` : ""}{new Date(time).toLocaleString()}
                </div>
            </div>
            <button
                className="icon-btn danger"
                onClick={(ev) => { ev.stopPropagation(); onDelete(session.id); }}
                aria-label="Удалить сессию"
                title="Удалить"
            >
                X
            </button>
        </div>
    );
}
