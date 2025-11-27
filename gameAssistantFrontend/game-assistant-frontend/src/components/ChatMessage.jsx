import React, { useState, useEffect } from "react";
import "../css/ChatPage.css";
import "../css/ChatMessage.css";
import { escapeText } from "../utils/utils";

export default function ChatMessage({ msg }) {
    const role = String(msg.role).toLowerCase();
    const isUser = role === "user";
    const isAssistant = role === "assistant";
    const isStreaming = !!msg._streaming;
    const text = String(msg.text || "");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isAssistant) return;
        setCopied(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [msg.id]);

    const copyToClipboard = async () => {
        const textToCopy = text;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const ta = document.createElement("textarea");
                ta.value = textToCopy;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (e) {
            setCopied(false);
        }
    };

    if (isUser) {
        return (
            <div className="chat-message user">
                <div className="chat-message-bubble">
                    <div
                        className="chat-message-text"
                        dangerouslySetInnerHTML={{
                            __html: String(escapeText(String(msg.text || ""))).replace(/\n/g, "<br/>")
                        }}
                    />
                </div>
            </div>
        );
    }

    if (isAssistant) {
        const hasAnyText = text.trim().length > 0;

        return (
            <div className={`chat-message bot ${isStreaming ? "streaming" : ""}`}>
                <div className="chat-message-plain">

                    {isStreaming && !hasAnyText ? (
                        <div className="chat-message-text streaming-placeholder">
                            <span className="streaming-dots" aria-hidden>
                                <span>•</span><span>•</span><span>•</span>
                            </span>
                        </div>
                    ) : (
                        <div
                            className={`chat-message-text ${isStreaming ? "streaming-text" : ""}`}
                            dangerouslySetInnerHTML={{
                                __html: String(escapeText(text)).replace(/\n/g, "<br/>")
                            }}
                        />
                    )}

                    {!isStreaming && (
                        <div className="chat-message-actions">
                            <button
                                className={`copy-icon-btn ${copied ? "copied" : ""}`}
                                onClick={copyToClipboard}
                                aria-label="Скопировать ответ"
                                title="Скопировать ответ"
                            >
                                {!copied ? (
                                    <svg
                                        className="copy-icon"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                ) : (
                                    <svg
                                        className="copy-icon copied-icon"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="chat-message error">
            <div className="chat-message-plain">
                <div
                    className="chat-message-text"
                    dangerouslySetInnerHTML={{
                        __html: String(escapeText(String(msg.text || ""))).replace(/\n/g, "<br/>")
                    }}
                />
            </div>
        </div>
    );
}
