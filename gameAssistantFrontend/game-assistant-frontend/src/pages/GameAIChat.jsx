import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import ChatSidebarItem from "../components/ChatSidebarItem";
import ChatMessage from "../components/ChatMessage";
import { aiApi } from "../api/ai";
import { userApi } from "../api/users";
import { gameApi } from "../api/game";
import "../css/ChatPage.css";

const STORAGE_PREFIX = "game_ai_sessions_v1::game::";

export default function GameAIChat() {
    const navigate = useNavigate();
    const location = useLocation();
    const passedGame = location.state?.game;

    const [game, setGame] = useState(passedGame || null);
    const [currentUser, setCurrentUser] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const messagesRef = useRef(null);
    const [confirmState, setConfirmState] = useState({ open: false, title: "", text: "", onConfirm: null });

    const loadAllSessionsFromStorage = () => {
        const out = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;
                if (!key.startsWith(STORAGE_PREFIX)) continue;

                if (key.includes("::msgs::")) continue;

                const parts = key.split("::");
                const maybeGameId = parts[parts.length - 1];
                try {
                    const raw = localStorage.getItem(key);
                    const parsed = raw ? JSON.parse(raw) : [];
                    if (Array.isArray(parsed)) {
                        parsed.forEach(s => {
                            if (s && typeof s === "object" && !("role" in s)) {
                                out.push({
                                    ...s,
                                    gameId: String(maybeGameId),
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.warn("chat: parse sessions from storage failed", key, e);
                }
            }
        } catch (e) {
            console.warn("chat: loadAllSessionsFromStorage failed", e);
        }
        out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return out;
    };

    const refreshAllSessions = async () => {
        try {
            if (typeof aiApi.getSessions === "function" && game) {
                const allGameSessions = await aiApi.getSessions(game.id);
                allGameSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setSessions(allGameSessions);
                return allGameSessions;
            } else {
                const all = loadAllSessionsFromStorage();
                setSessions(all);
                return all;
            }
        } catch (err) {
            console.warn("chat: refreshAllSessions failed, fallback to storage", err);
            const all = loadAllSessionsFromStorage();
            setSessions(all);
            return all;
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const u = await userApi.getAuthenticated();
                if (mounted) setCurrentUser(u);
            } catch (err) {
                console.warn("chat: could not load authenticated user", err);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        (async () => await refreshAllSessions())();
        return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game]);

    useEffect(() => {
        if (!activeSession) {
            setMessages([]);
            return;
        }
        let mounted = true;
        (async () => {
            try {
                const msgs = await aiApi.getMessages(activeSession.gameId, activeSession.id);
                if (mounted) {
                    setMessages(msgs || []);
                    setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 50);
                }
            } catch (err) {
                console.warn("chat: getMessages failed", err);
                if (mounted) setMessages([]);
            }
        })();
        return () => { mounted = false; };
    }, [activeSession]);

    const handleDeleteSession = async (sessionId) => {
        setConfirmState({
            open: true,
            title: "Удалить сессию?",
            text: "Вы уверены, что хотите удалить сессию? Это действие нельзя отменить.",
            onConfirm: async () => {
                try {
                    const session = sessions.find(s => s.id === sessionId);
                    const gid = (session && session.gameId) ? session.gameId : (game?.id ? String(game.id) : null);
                    await aiApi.deleteSession(gid, sessionId);
                    setConfirmState({ open: false });
                    const next = sessions.filter(s => s.id !== sessionId);
                    setSessions(next);
                    if (activeSession?.id === sessionId) {
                        setActiveSession(next[0] || null);
                    }
                } catch (err) {
                    console.error(err);
                    alert("Не удалось удалить сессию.");
                    setConfirmState({ open: false });
                }
            },
        });
    };

    const handleSend = async () => {
        if (!game && !activeSession) {
            alert("Выберите сессию или игру.");
            return;
        }

        let sessionToUse = activeSession;

        if (!sessionToUse) {
            if (!game || !game.id) {
                alert("Необходимо выбрать игру для создания сессии.");
                return;
            }
            try {
                const gidStr = String(game.id);
                const created = await aiApi.createSession(gidStr, `Сессия — ${new Date().toLocaleString()}`);
                created.gameId = gidStr;
                created.gameTitle = game.title;
                await refreshAllSessions();
                setActiveSession(created);
                sessionToUse = created;
            } catch (err) {
                console.error("chat: failed to create session on send", err);
                alert("Не удалось создать сессию. Попробуйте снова.");
                return;
            }
        }

        if (!input.trim()) return;

        const text = input.slice(0, 10000);
        setInput("");
        setSending(true);

        const tmpUser = {
            id: `tmp_user_${Date.now()}`,
            role: "user",
            text,
            createdAt: new Date().toISOString(),
            _temp: true,
        };
        const tmpBot = {
            id: `tmp_bot_${Date.now()}`,
            role: "bot",
            text: "Думаю...",
            createdAt: new Date().toISOString(),
            _temp: true,
        };

        setMessages(prev => [...prev, tmpUser, tmpBot]);
        setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 50);

        try {
            await aiApi.sendMessage(sessionToUse.gameId, sessionToUse.id, text);
            const fresh = await aiApi.getMessages(sessionToUse.gameId, sessionToUse.id);
            setMessages(fresh || []);
            await refreshAllSessions();
        } catch (err) {
            console.error("chat: sendMessage failed", err);
            setMessages(prev => {
                const copy = [...prev];
                const idx = copy.findIndex(m => m._temp && m.role === "bot");
                if (idx >= 0) {
                    copy[idx] = {
                        id: `err_bot_${Date.now()}`,
                        role: "bot",
                        text: "Ошибка при получении ответа от сервера.",
                        createdAt: new Date().toISOString(),
                    };
                }
                return copy;
            });
            alert(err?.message || "Ошибка отправки сообщения");
        } finally {
            setSending(false);
            setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 80);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSelectSession = async (session) => {
        setActiveSession(session);
        try {
            const sGame = await gameApi.read(session.gameId);
            setGame(sGame || null);
            const ms = await aiApi.getMessages(session.gameId, session.id);
            setMessages(ms || []);
            setSidebarOpen(false);
        } catch (err) {
            console.warn("chat: get session game or get session messages on select failed", err);
            setMessages([]);
        }
    };

    useEffect(() => {
        if (passedGame && (!game || String(game.id) !== String(passedGame.id))) {
            setGame(passedGame);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [passedGame]);

    return (
        <div className="chat-root">
            <Header currentUser={currentUser} />

            <div className="chat-container">
                <button className="hamburger hide-on-desktop" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sessions">
                    ☰
                </button>

                <aside className={`chat-sidebar ${sidebarOpen ? "open" : ""}`}>
                    <div className="chat-sidebar-header">
                        <div>{`Чаты${game ? ` по игре "${game.title}"` : ""}`}</div>
                        <div className="chat-sidebar-actions">
                            <button className="btn btn-ghost hide-on-desktop" onClick={() => setSidebarOpen(false)}>✕</button>
                        </div>
                    </div>

                    <div className="chat-sessions-list">
                        {sessions.length === 0 && <div className="muted-empty">Нет сессий</div>}
                        {sessions.map(s => (
                            <ChatSidebarItem
                                key={s.id}
                                session={s}
                                active={s.id === activeSession?.id}
                                onSelect={handleSelectSession}
                                onDelete={handleDeleteSession}
                            />
                        ))}
                    </div>
                </aside>

                <main className="chat-main">
                    {activeSession ? (
                        <div className="chat-main-inner">
                            <div className="chat-title-area">
                                <h2>Id: {activeSession.id}</h2>
                                <div className="chat-session-current">{activeSession.title}</div>
                            </div>

                            <div className="chat-messages" ref={messagesRef}>
                                {messages.length === 0 && <div className="muted">Начните диалог — задайте вопрос ИИ.</div>}
                                {messages.map(m => <ChatMessage key={m.id} msg={m} />)}
                            </div>

                            <div className="chat-input-area">
                                <textarea
                                    className="chat-input"
                                    placeholder="Напишите подробно ваш вопрос..."
                                    value={input}
                                    maxLength={10000}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={2}
                                />
                                <div className="chat-input-actions">
                                    <button className="btn btn-ghost" onClick={() => setInput("")}>Очистить</button>
                                    <button
                                        className="btn"
                                        onClick={handleSend}
                                        disabled={sending || !input.trim() || !activeSession}
                                    >
                                        {sending ? "Отправка..." : "Отправить"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="chat-main-inner">
                            <div className="muted">
                                <div className="muted-empty">
                                    {sessions.length === 0
                                        ? (game ? "Отправьте сообщение, чтобы создать новую сессию для выбранной игры" : "У вас еще нет ни одного чата")
                                        : (game ? "Выберите существующую сессию или отправьте сообщение, чтобы создать новую сессию для выбранной игры" : "Выберите существующую сессию или создайте новую, выбрав игру из каталога")}
                                    {!game &&
                                        <button className="btn chat-catalog-btn" onClick={() => navigate('/')}>Каталог игр</button>
                                    }
                                </div>
                                {game &&
                                    <div className="chat-input-area">
                                        <textarea
                                            className="chat-input"
                                            placeholder="Напишите подробно ваш вопрос..."
                                            value={input}
                                            maxLength={10000}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            rows={3}
                                            disabled={!game}
                                        />
                                        <div className="chat-input-actions">
                                            <button className="btn btn-ghost" onClick={() => setInput("")}>Очистить</button>
                                            <button
                                                className="btn"
                                                onClick={handleSend}
                                                disabled={sending || !input.trim() || !game}
                                            >
                                                {sending ? "Отправка..." : "Отправить"}
                                            </button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    )}
                </main>
            </div >

            {
                confirmState.open && (
                    <Modal title={confirmState.title} onClose={() => setConfirmState({ open: false })}>
                        <p>{confirmState.text}</p>
                        <div className="admin-modal-actions">
                            <button className="btn btn-ghost" onClick={() => setConfirmState({ open: false })}>Отмена</button>
                            <button className="btn btn-danger" onClick={confirmState.onConfirm}>Удалить</button>
                        </div>
                    </Modal>
                )
            }
        </div >
    );
}
