import React from "react";

import "../css/ChatPage.css";
import "../css/ChatMessage.css";

export default function ChatMessage({ msg }) {
    const timeIso = msg.timestamp || msg.createdAt || msg.time || new Date().toISOString();
    return (
        <div className={`chat-message ${msg.role === "user" ? "user" : "bot"}`}>
            <div className="chat-message-bubble">
                <div className="chat-message-text" dangerouslySetInnerHTML={{ __html: String(msg.text).replace(/\n/g, "<br/>") }} />
                <div className="chat-message-time">{new Date(timeIso).toLocaleString()}</div>
            </div>
        </div>
    );
}
