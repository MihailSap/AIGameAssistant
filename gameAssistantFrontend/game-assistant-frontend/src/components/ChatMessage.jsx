import React from "react";
import "../css/ChatPage.css";
import "../css/ChatMessage.css";
import { escapeText } from "../utils/utils";

export default function ChatMessage({ msg }) {
    if (String(msg.role).toLowerCase() === "user") {
        return (
            <div className="chat-message user">
                <div className="chat-message-bubble">
                    <div className="chat-message-text" dangerouslySetInnerHTML={{ __html: String(escapeText(String(msg.text || ""))).replace(/\n/g, "<br/>") }} />
                </div>
            </div>
        );
    } else if (String(msg.role).toLowerCase() === "assistant") {
        return (
            <div className="chat-message bot">
                <div className="chat-message-plain">
                    <div className="chat-message-text" dangerouslySetInnerHTML={{ __html: String(escapeText(String(msg.text || ""))).replace(/\n/g, "<br/>") }} />
                </div>
            </div>
        );
    } else {
        return (
            <div className="chat-message error">
                <div className="chat-message-plain">
                    <div className="chat-message-text" dangerouslySetInnerHTML={{ __html: String(escapeText(String(msg.text || ""))).replace(/\n/g, "<br/>") }} />
                </div>
            </div>
        );
    }
}
