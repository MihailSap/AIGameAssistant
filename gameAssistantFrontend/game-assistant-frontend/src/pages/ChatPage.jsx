import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import ChatSidebarItem from "../components/ChatSidebarItem";
import ChatMessage from "../components/ChatMessage";
import { chatApi } from "../api/chat";
import { userApi } from "../api/users";
import { gameApi } from "../api/game";
import "../css/ChatPage.css";

function makeId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function GameAIChat() {
    const navigate = useNavigate();
    const params = useParams();
    const routeGameId = params.gameId;
    const routeChatId = params.chatId;

    const [game, setGame] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const messagesRef = useRef(null);
    const [confirmState, setConfirmState] = useState({ open: false, title: "", text: "", onConfirm: null });

    const refreshAllSessions = async (useGame = game) => {
        try {
            if (!useGame || !useGame.id) {
                setSessions([]);
                return [];
            }
            const previews = await chatApi.getChatPreviewsByGame(useGame.id);
            const mapped = (Array.isArray(previews) ? previews : []).map(p => ({
                id: p.id != null ? String(p.id) : makeId("s"),
                title: p.title || "Чат",
                lastUseTime: p.lastUseTime ? new Date(p.lastUseTime).toISOString() : new Date().toISOString(),
                createdAt: p.lastUseTime ? new Date(p.lastUseTime).toISOString() : new Date().toISOString(),
                gameId: String(useGame.id),
                gameTitle: useGame.title,
            }));
            mapped.sort((a, b) => new Date(b.lastUseTime) - new Date(a.lastUseTime));
            setSessions(mapped);
            return mapped;
        } catch (err) {
            console.warn("chat: refreshAllSessions failed", err);
            setSessions([]);
            return [];
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
        let mounted = true;
        (async () => {
            if (!routeGameId) return;
            try {
                const g = await gameApi.read(routeGameId);
                if (!mounted) return;
                setGame(g || null);
            } catch (err) {
                console.warn("chat: failed to load game from route", err);
                if (mounted) setGame(null);
            }
        })();
        return () => { mounted = false; };
    }, [routeGameId]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const all = await refreshAllSessions();
            if (!mounted) return;
            if (routeChatId && all && all.length > 0) {
                const found = all.find(s => String(s.id) === String(routeChatId));
                if (found) {
                    await selectSession(found, { navigateToRoute: false });
                }
            }
        })();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game, routeChatId]);

    useEffect(() => {
        if (!activeSession) {
            setMessages([]);
            return;
        }
        if (activeSession._temp) {
            return;
        }

        let mounted = true;
        (async () => {
            try {
                const chatDto = await chatApi.getChat(activeSession.id);
                if (!mounted) return;
                const mapped = (chatDto?.messageDTOs || []).map((m, i) => ({
                    id: `${activeSession.id}_${i}_${new Date(m.timestamp || Date.now()).getTime()}`,
                    role: m.role ? String(m.role).toLowerCase() : "bot",
                    text: m.text || "",
                    createdAt: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
                }));
                setMessages(mapped.slice(1));
                setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 50);
            } catch (err) {
                console.warn("chat: getChat failed", err);
                setMessages([]);
            }
        })();
        return () => { mounted = false; };
    }, [activeSession]);

    const selectSession = async (session, { navigateToRoute = true } = {}) => {
        setActiveSession(session);
        if (navigateToRoute) {
            navigate(`/games/ai/${session.gameId}/${session.id}`);
        }
        try {
            const chatDto = await chatApi.getChat(session.id);
            const mapped = (chatDto?.messageDTOs || []).map((m, i) => ({
                id: `${session.id}_${i}_${new Date(m.timestamp || Date.now()).getTime()}`,
                role: m.role ? String(m.role).toLowerCase() : "bot",
                text: m.text || "",
                createdAt: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
            }));
            setMessages(mapped.slice(1));
            setSidebarOpen(false);
            setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 40);
        } catch (err) {
            console.warn("chat: selectSession failed", err);
            setMessages([]);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        setConfirmState({
            open: true,
            title: "Удалить сессию?",
            text: "Вы уверены, что хотите удалить сессию? Это действие нельзя отменить.",
            onConfirm: async () => {
                try {
                    await chatApi.deleteChat(sessionId);
                    setConfirmState({ open: false });
                    const next = sessions.filter(s => s.id !== sessionId);
                    setSessions(next);
                    if (String(activeSession?.id) === String(sessionId)) {
                        if (game && game.id) navigate(`/games/ai/${game.id}`);
                        else navigate("/games/ai");
                        setActiveSession(null);
                        setMessages([]);
                    }
                } catch (err) {
                    console.error(err);
                    alert("Не удалось удалить сессию.");
                    setConfirmState({ open: false });
                }
            },
        });
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 40);
    };

    const handleSend = async () => {
        if (!game && !activeSession) {
            alert("Выберите игру или откройте существующую сессию.");
            return;
        }
        if (!input.trim()) return;

        const text = input.slice(0, 10000);
        setInput("");
        setSending(true);

        const now = new Date().toISOString();
        let sessionToUse = activeSession;
        let createdTempSession = null;

        if (!sessionToUse) {
            const tempId = makeId("s_tmp");
            const tempSession = {
                id: tempId,
                title: `Сессия — ${new Date(now).toLocaleString()}`,
                lastUseTime: now,
                createdAt: now,
                gameId: String(game.id),
                gameTitle: game.title,
                _temp: true,
                _loading: true,
            };
            createdTempSession = tempSession;
            setSessions(prev => [tempSession, ...prev.filter(s => !s._temp)]);
            setActiveSession(tempSession);
            sessionToUse = tempSession;
            navigate(`/games/ai/${game.id}/${tempId}`, { replace: false });
        }

        const tmpUser = {
            id: makeId("u_tmp"),
            role: "user",
            text,
            createdAt: now,
            _temp: true,
        };
        const tmpBot = {
            id: makeId("b_tmp"),
            role: "bot",
            text: "Думаю...",
            createdAt: now,
            _temp: true,
        };

        setMessages(prev => [...prev, tmpUser, tmpBot]);
        scrollToBottom();

        try {
            if (createdTempSession) {
                const chatDto = await chatApi.startChat({ gameId: Number(game.id), request: text });
                const serverId = chatDto?.id != null ? String(chatDto.id) : makeId("s_srv");
                const serverSession = {
                    id: serverId,
                    title: chatDto?.title || createdTempSession.title,
                    lastUseTime: chatDto?.lastUseTime ? new Date(chatDto.lastUseTime).toISOString() : new Date().toISOString(),
                    createdAt: chatDto?.lastUseTime ? new Date(chatDto.lastUseTime).toISOString() : createdTempSession.createdAt,
                    gameId: String(game.id),
                    gameTitle: game.title,
                };
                setSessions(prev => {
                    const withoutTemp = prev.filter(s => s.id !== createdTempSession.id);
                    return [serverSession, ...withoutTemp];
                });
                navigate(`/games/ai/${game.id}/${serverSession.id}`, { replace: true });
                setActiveSession(serverSession);
                const mapped = (chatDto?.messageDTOs || []).map((m, i) => ({
                    id: `${serverSession.id}_${i}_${new Date(m.timestamp || Date.now()).getTime()}`,
                    role: m.role ? String(m.role).toLowerCase() : "bot",
                    text: m.text || "",
                    createdAt: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
                }));
                setMessages(mapped.slice(1));
                await refreshAllSessions();
            } else {
                const chatDto = await chatApi.continueChat(sessionToUse.id, { request: text });
                const serverId = chatDto?.id != null ? String(chatDto.id) : sessionToUse.id;
                const updatedSession = {
                    id: serverId,
                    title: chatDto?.title || sessionToUse.title,
                    lastUseTime: chatDto?.lastUseTime ? new Date(chatDto.lastUseTime).toISOString() : new Date().toISOString(),
                    createdAt: chatDto?.lastUseTime ? new Date(chatDto.lastUseTime).toISOString() : sessionToUse.createdAt,
                    gameId: sessionToUse.gameId,
                    gameTitle: sessionToUse.gameTitle,
                };
                setSessions(prev => [updatedSession, ...prev.filter(s => s.id !== updatedSession.id)]);
                if (!routeChatId || String(routeChatId) !== String(updatedSession.id)) {
                    navigate(`/games/ai/${updatedSession.gameId}/${updatedSession.id}`, { replace: false });
                }
                setActiveSession(updatedSession);
                const mapped = (chatDto?.messageDTOs || []).map((m, i) => ({
                    id: `${updatedSession.id}_${i}_${new Date(m.timestamp || Date.now()).getTime()}`,
                    role: m.role ? String(m.role).toLowerCase() : "bot",
                    text: m.text || "",
                    createdAt: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
                }));
                setMessages(mapped.slice(1));
                await refreshAllSessions();
            }
        } catch (err) {
            console.error("chat: send failed", err);
            setMessages(prev => {
                const copy = [...prev];
                const idx = copy.findIndex(m => m._temp && m.role === "bot");
                if (idx >= 0) {
                    copy[idx] = {
                        id: makeId("b_err"),
                        role: "bot",
                        text: "Ошибка при получении ответа от сервера.",
                        createdAt: new Date().toISOString(),
                    };
                }
                return copy;
            });
            alert(err?.response?.data?.message || err?.message || "Ошибка отправки сообщения");
        } finally {
            setSending(false);
            scrollToBottom();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSidebarSelect = async (session) => {
        await selectSession(session, { navigateToRoute: true });
    };

    useEffect(() => {
        if (!routeGameId) return;
    }, [routeGameId]);

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
                                onSelect={handleSidebarSelect}
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
                                <div className="chat-session-current">
                                    {activeSession._loading ? <span className="shimmer-title">Загрузка…</span> : activeSession.title}
                                </div>
                            </div>

                            <div className="chat-messages" ref={messagesRef}>
                                {(messages.length === 0 && !sending) && <div className="muted">Начните диалог — задайте вопрос ИИ.</div>}
                                {messages.map((m, idx) => <ChatMessage key={m.id} msg={m} />)}
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
                                        disabled={sending || !input.trim()}
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
