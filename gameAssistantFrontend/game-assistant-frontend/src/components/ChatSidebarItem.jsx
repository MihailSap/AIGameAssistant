import React from "react";

import "../css/ChatPage.css";
import "../css/ChatSidebarItem.css";

export default function ChatSidebarItem({ session, active, onSelect, onDelete }) {
    return (
        <div
            className={`chat-session-item ${active ? "active" : ""}`}
            onClick={() => onSelect(session)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(session)}
        >
            <div style={{ minWidth: 0, overflow: "hidden" }}>
                <div className="session-title">{session.title}</div>
                <div className="session-meta">
                    {session.gameTitle ? `${session.gameTitle} • ` : ""}{new Date(session.createdAt).toLocaleString()}
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
