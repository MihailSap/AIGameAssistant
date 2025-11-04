import React from "react";
import "../css/ChatPage.css";
import "../css/ChatSidebarItem.css";
import { formatDate } from "../utils/utils";

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
            <div className="session-info">
                <div className="session-title">
                    {session._loading ? "Загрузка…" : session.title}
                </div>
                <div className="session-meta">
                    {formatDate(time)}
                </div>
            </div>
            <button
                className="chat-sidebar-icon-btn danger"
                onClick={(ev) => { ev.stopPropagation(); onDelete(session.id); }}
                aria-label="Удалить сессию"
                title="Удалить"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 11v6" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 11v6" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}
