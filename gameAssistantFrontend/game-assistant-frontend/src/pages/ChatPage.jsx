import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import ChatSidebarItem from "../components/ChatSidebarItem";
import ChatMessage from "../components/ChatMessage";
import FileViewer from "../components/FileViewer";
import SelectDropdown from "../components/SelectDropdown";
import { chatApi } from "../api/chat";
import { userApi } from "../api/users";
import { gameApi } from "../api/game";
import { modelApi } from "../api/model";
import { backendToFrontendModel } from "../utils/model";
import "../css/ChatPage.css";

function makeId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function groupSessionsByTime(sessions) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const groups = new Map();
    const push = (name, item) => {
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name).push(item);
    };
    sessions.forEach(s => {
        const time = new Date(s.lastUseTime || s.createdAt || Date.now());
        if (time >= startOfToday) {
            push("Сегодня", s);
            return;
        }
        if (time >= startOfYesterday && time < startOfToday) {
            push("Вчера", s);
            return;
        }
        if (time >= startOfWeek) {
            push("Последняя неделя", s);
            return;
        }
        if (time >= startOfMonth) {
            push("В этом месяце", s);
            return;
        }
        const monthName = time.toLocaleString(undefined, { month: "long", year: "numeric" });
        push(monthName, s);
    });
    const order = ["Сегодня", "Вчера", "Последняя неделя", "В этом месяце"];
    const rest = Array.from(groups.keys()).filter(k => !order.includes(k));
    rest.sort((a, b) => new Date(a) - new Date(b));
    const final = [];
    order.forEach(k => { if (groups.has(k)) final.push([k, groups.get(k)]); });
    rest.forEach(k => final.push([k, groups.get(k)]));
    return final;
}

export default function ChatPage() {
    const navigate = useNavigate();
    const params = useParams();
    const routeGameId = params.gameId;
    const routeChatId = params.chatId;

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gameLoading, setGameLoading] = useState(true);
    const [chatsLoading, setChatsLoading] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [modelChanging, setModelChanging] = useState(false);
    const [chatError, setChatError] = useState(null);

    const [game, setGame] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 900 : false);
    const [rulesSidebarOpen, setRulesSidebarOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);

    const messagesRef = useRef(null);
    const inputRef = useRef(null);

    const activeStreamRef = useRef(null);

    const [confirmState, setConfirmState] = useState({ open: false, text: "", onConfirm: null });

    const refreshAllSessions = async (useGame = game) => {
        setChatsLoading(true);
        let mapped = [];
        try {
            if (!useGame || !useGame.id) {
                setSessions([]);
                return [];
            }
            const previews = await chatApi.getChatPreviewsByGame(useGame.id);
            mapped = (Array.isArray(previews) ? previews : []).map(p => ({
                id: p.id != null ? String(p.id) : makeId("s"),
                title: p.title || "Чат",
                lastUseTime: p.lastUseTime ? new Date(p.lastUseTime).toISOString() : new Date().toISOString(),
                createdAt: p.lastUseTime ? new Date(p.lastUseTime).toISOString() : new Date().toISOString(),
            }));
            mapped.sort((a, b) => new Date(b.lastUseTime) - new Date(a.lastUseTime));
            setError(null);
        } catch (err) {
            mapped = [];
            setError("Ошибка при загрузке чатов");
        } finally {
            setChatsLoading(false);
            setSessions(mapped);
            return mapped;
        }
    };

    const adjustTextareaHeight = (el) => {
        if (!el) return 0;
        el.style.height = "auto";
        const max = 220;
        const newH = Math.min(el.scrollHeight, max);
        el.style.height = `${newH}px`;
        return newH;
    };

    useEffect(() => {
        adjustTextareaHeight(inputRef.current);
    }, []);

    useEffect(() => {
        if (!input) {
            if (inputRef.current) inputRef.current.style.height = "";
        } else {
            adjustTextareaHeight(inputRef.current);
        }

        setTimeout(() => {
            if (messagesRef.current) {
                messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'auto' });
            }
        }, 0);
    }, [input]);

    useEffect(() => {
        setLoading(true);
        let mounted = true;
        (async () => {
            try {
                const user = await userApi.getAuthenticated();
                if (!mounted) return;
                setCurrentUser(user);
                setSelectedModel(user.model || 'Yandex-GPT');
            } catch (err) {
                setError("Ошибка при получении данных пользователя")
                if (!mounted) return;
                setCurrentUser(null);
                setSelectedModel(null);
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        setGameLoading(true);
        let mounted = true;
        (async () => {
            if (!routeGameId) {
                setGameLoading(false);
                return;
            }
            try {
                const g = await gameApi.read(routeGameId);
                if (!mounted) return;
                setGame(g || null);
                setError(null);
            } catch (err) {
                setError("Ошибка при загрузке чатов")
                if (mounted) setGame(null);
            } finally {
                setGameLoading(false);
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
                } else {
                    navigate(`/games/ai/${game.id}`);
                }
            }
        })();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game, routeChatId]);

    useEffect(() => {
        return () => {
            if (activeStreamRef.current && typeof activeStreamRef.current.close === "function") {
                activeStreamRef.current.close();
            }
        };
    }, []);

    const fetchIdRef = useRef(0);

    const selectSession = async (session, { navigateToRoute = true } = {}) => {
        setActiveSession(session);
        if (navigateToRoute) {
            navigate(`/games/ai/${game?.id}/${session.id}`);
        }

        setChatError(null);
        setChatLoading(true);
        setMessages([]);
        setInput("");

        fetchIdRef.current += 1;
        const thisFetchId = fetchIdRef.current;

        try {
            const chatDto = await chatApi.getChat(session.id);

            if (thisFetchId !== fetchIdRef.current) return;

            const mapped = (chatDto?.messageDTOs || []).map((m, i) => ({
                id: `${session.id}_${i}_${new Date(m.timestamp || Date.now()).getTime()}`,
                role: m.role ? String(m.role).toLowerCase() : "assistant",
                text: m.text || "",
                createdAt: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
            }));

            mapped.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setMessages(mapped);

            setChatError(null);

            if (typeof window !== "undefined") {
                if (window.innerWidth < 900) {
                    setSidebarOpen(false);
                }
            } else {
                setSidebarOpen(false);
            }

            setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 40);
        } catch (err) {
            if (thisFetchId !== fetchIdRef.current) return;
            setChatError("Ошибка при загрузке чата");
            setMessages([]);
        } finally {
            if (thisFetchId === fetchIdRef.current) {
                setChatLoading(false);
            }
        }
    };


    const handleDeleteSession = async (sessionId) => {
        setConfirmState({
            open: true,
            text: "Вы уверены, что хотите удалить чат? Это действие нельзя отменить.",
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
                    alert("Не удалось удалить сессию.");
                    setConfirmState({ open: false });
                }
            },
        });
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }), 40);
    };

    const closeActiveStream = () => {
        if (activeStreamRef.current && typeof activeStreamRef.current.close === "function") {
            try { activeStreamRef.current.close(); } catch (e) { }
            activeStreamRef.current = null;
        }
    };

    const mergeChunkWithPrev = (prev, chunk) => {
        if (!prev) return chunk;
        return prev + chunk;
    };

    const handleSend = async () => {
        if (!game && !activeSession) {
            alert("Выберите игру или откройте существующую сессию.");
            return;
        }
        if (modelChanging) return;
        if (!input.trim()) return;
        const text = input.slice(0, 10000);
        setInput("");
        setSending(true);
        closeActiveStream();
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
        const initialStreamId = `${sessionToUse.id}_stream_${Date.now()}`;
        const streamPlaceholder = {
            id: initialStreamId,
            role: "assistant",
            text: "",
            createdAt: now,
            _temp: true,
            _streaming: true,
        };
        setMessages(prev => [...prev, tmpUser, streamPlaceholder]);
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
                };
                setSessions(prev => {
                    const withoutTemp = prev.filter(s => s.id !== createdTempSession.id);
                    return [serverSession, ...withoutTemp];
                });
                navigate(`/games/ai/${game.id}/${serverSession.id}`, { replace: true });
                setActiveSession(serverSession);

                const streamId = `${serverSession.id}_stream_${Date.now()}`;

                setMessages(prev => {
                    const withoutTemp = prev.filter(m => !(m._temp && m.role === "assistant"));
                    const existing = withoutTemp.find(m => m.id === streamId);
                    if (existing) {
                        return withoutTemp.map(m => m.id === streamId ? { ...m, _streaming: true, text: "" } : m);
                    }
                    return [...withoutTemp, { id: streamId, role: "assistant", text: "", createdAt: new Date().toISOString(), _streaming: true }];
                });

                const streamController = chatApi.streamAnswer(serverSession.id, {
                    onChunk: (chunk) => {
                        setMessages(prev => {
                            const copy = prev.slice();
                            const idx = copy.findIndex(m => m.id === streamId);
                            if (idx >= 0) {
                                const prevText = copy[idx].text || "";
                                const newText = mergeChunkWithPrev(prevText, chunk);
                                copy[idx] = { ...copy[idx], text: newText };
                            } else {
                                copy.push({ id: streamId, role: "assistant", text: chunk, createdAt: new Date().toISOString(), _streaming: true });
                            }
                            return copy;
                        });
                        scrollToBottom();
                    },
                    onComplete: () => {
                        setMessages(prev => prev.map(m => m.id === streamId ? { ...m, _streaming: false } : m));
                        setSending(false);
                        refreshAllSessions();
                        activeStreamRef.current = null;
                        scrollToBottom();
                    },
                    onError: (err) => {
                        setMessages(prev => {
                            const copy = prev.slice();
                            const idx = copy.findIndex(m => m.id === streamId);
                            if (idx >= 0) {
                                copy[idx] = { id: makeId("b_err"), role: "error", text: "Ошибка при получении ответа от сервера.", createdAt: new Date().toISOString() };
                            }
                            return copy;
                        });
                        setSending(false);
                        activeStreamRef.current = null;
                        console.error(err);
                    }
                });

                activeStreamRef.current = { controller: streamController, streamId };
            } else {
                const chatDto = await chatApi.continueChat(sessionToUse.id, text, selectedModel);
                const serverId = chatDto?.id != null ? String(chatDto.id) : sessionToUse.id;
                const updatedSession = {
                    id: serverId,
                    title: chatDto?.title || sessionToUse.title,
                    lastUseTime: chatDto?.lastUseTime ? new Date(chatDto.lastUseTime).toISOString() : new Date().toISOString(),
                    createdAt: chatDto?.lastUseTime ? new Date(chatDto.lastUseTime).toISOString() : sessionToUse.createdAt,
                };
                setSessions(prev => [updatedSession, ...prev.filter(s => s.id !== updatedSession.id)]);
                if (!routeChatId || String(routeChatId) !== String(updatedSession.id)) {
                    navigate(`/games/ai/${game.id}/${updatedSession.id}`, { replace: false });
                }
                setActiveSession(updatedSession);

                const streamId = `${updatedSession.id}_stream_${Date.now()}`;

                setMessages(prev => {
                    const withoutTemp = prev.filter(m => !(m._temp && m.role === "assistant"));
                    const existing = withoutTemp.find(m => m.id === streamId);
                    if (existing) {
                        return withoutTemp.map(m => m.id === streamId ? { ...m, _streaming: true, text: "" } : m);
                    }
                    return [...withoutTemp, { id: streamId, role: "assistant", text: "", createdAt: new Date().toISOString(), _streaming: true }];
                });

                const streamController = chatApi.streamAnswer(updatedSession.id, {
                    onChunk: (chunk) => {
                        setMessages(prev => {
                            const copy = prev.slice();
                            const idx = copy.findIndex(m => m.id === streamId);
                            if (idx >= 0) {
                                const prevText = copy[idx].text || "";
                                const newText = mergeChunkWithPrev(prevText, chunk);
                                copy[idx] = { ...copy[idx], text: newText };
                            } else {
                                copy.push({ id: streamId, role: "assistant", text: chunk, createdAt: new Date().toISOString(), _streaming: true });
                            }
                            return copy;
                        });
                        scrollToBottom();
                    },
                    onComplete: () => {
                        setMessages(prev => prev.map(m => m.id === streamId ? { ...m, _streaming: false } : m));
                        setSending(false);
                        refreshAllSessions();
                        activeStreamRef.current = null;
                        scrollToBottom();
                    },
                    onError: (err) => {
                        setMessages(prev => {
                            const copy = prev.slice();
                            const idx = copy.findIndex(m => m.id === streamId);
                            if (idx >= 0) {
                                copy[idx] = { id: makeId("b_err"), role: "error", text: "Ошибка при получении ответа от сервера.", createdAt: new Date().toISOString() };
                            }
                            return copy;
                        });
                        setSending(false);
                        activeStreamRef.current = null;
                        console.error(err);
                    }
                });

                activeStreamRef.current = { controller: streamController, streamId };
            }
        } catch (err) {
            setMessages(prev => {
                const copy = [...prev];
                const idx = copy.findIndex(m => m._temp && m.role === "assistant");
                if (idx >= 0) {
                    copy[idx] = {
                        id: makeId("b_err"),
                        role: "error",
                        text: "Ошибка при получении ответа от сервера.",
                        createdAt: new Date().toISOString(),
                    };
                }
                return copy;
            });
            setSending(false);
            console.error(err);
        } finally {
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
        if (typeof window !== "undefined" && window.innerWidth < 900) setSidebarOpen(false);
    };

    const handleChangeModel = async (newModel) => {
        if (modelChanging) return;
        try {
            if (!newModel) return;
            setModelChanging(true);
            await modelApi.updateUser(currentUser.id, newModel);
            setSelectedModel(newModel);
        } catch (err) {
            alert("Не удалось изменить модель.");
        } finally {
            setModelChanging(false);
        }
    }

    const grouped = groupSessionsByTime(sessions);

    return (
        <div className="chat-root">
            <Header currentUser={currentUser} centralTitle={(!gameLoading && !error) ? game?.title : ""} />

            {(gameLoading || loading) && (
                <div className="full-loader">
                    <div className="spinner" />
                </div>
            )}

            {!gameLoading && !loading && error && <div className="loading-error">{error}</div>}

            {!gameLoading && !loading && !error &&
                <div className="chat-page-switch-container">
                    <SelectDropdown
                        fetchItems={() => modelApi.getAll()}
                        cacheKey="models"
                        value={selectedModel}
                        onChange={modelChanging ? () => {} : handleChangeModel}
                        allowNull={false}
                        placeholder="Выберите модель"
                        ariaLabel="Модель нейросети"
                        labelFunc={(m) => backendToFrontendModel(m)}
                    />
                </div>
            }

            {!gameLoading && !loading && !error && (
                <div className="chat-container">
                    {game && (
                        <button
                            className={`sidebar-toggle ${sidebarOpen ? "hidden" : ""}`}
                            onClick={() => {
                                setSidebarOpen(true);
                                setRulesSidebarOpen(false);
                            }}
                            aria-label="Открыть список чатов"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip=""><path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path></svg>
                        </button>
                    )}
                    {game && (
                        <aside className={`chat-sidebar sessions-sidebar ${sidebarOpen ? "open" : ""}`} aria-hidden={!sidebarOpen && typeof window !== "undefined" && window.innerWidth < 900}>
                            <div className="chat-sidebar-header">
                                <h2 className="sidebar-title">Мои чаты по игре</h2>
                                <div className="chat-sidebar-actions">
                                    <button className="chat-sidebar-btn" onClick={() => setSidebarOpen(false)} aria-label="Свернуть меню">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" data-rtl-flip=""><path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="chat-sessions-list">
                                {chatsLoading && sessions.length === 0 && <div className="sidebar-muted-empty">Загрузка...</div>}
                                {!chatsLoading && sessions.length === 0 && <div className="sidebar-muted-empty">Ещё нет ни одного чата</div>}
                                {grouped.map(([groupName, items]) => (
                                    <div key={groupName} className="session-group">
                                        <h3 className="session-group-title">{groupName}</h3>
                                        <div className="session-group-list">
                                            {items.map(s => (
                                                <ChatSidebarItem
                                                    key={s.id}
                                                    session={s}
                                                    active={s.id === activeSession?.id}
                                                    onSelect={handleSidebarSelect}
                                                    onDelete={handleDeleteSession}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    )}
                    <main className="chat-main">
                        {!routeGameId ? (
                            <div className="chat-main-inner">
                                <div className="not-found-container">
                                    <div className="chat-not-found">Выберите конкретную игру из каталога</div>
                                    <button className="btn btn-to-main" onClick={() => navigate('/')}>Посмотреть доступные игры</button>
                                </div>
                            </div>
                        ) : game === null ? (
                            <div className="chat-main-inner">
                                <div className="not-found-container">
                                    <div className="chat-not-found">Игра не найдена, выберите игру из каталога</div>
                                    <button className="btn btn-to-main" onClick={() => navigate('/')}>Посмотреть доступные игры</button>
                                </div>
                            </div>
                        ) : (
                            <div className="chat-main-inner">
                                <div className="chat-dialog-container">
                                    {chatError && <div className="chat-muted">{chatError}</div>}
                                    {chatLoading && !chatError && <div className="chat-muted">Загрузка...</div>}
                                    {!chatLoading && !chatError && messages.length === 0 && !sending && !activeSession && <div className="chat-muted">Чем я могу помочь?</div>}
                                    {!chatLoading && !chatError &&
                                        <div className="chat-messages" ref={messagesRef}>
                                            <div className="messages-inner">
                                                {messages.map((m) => <ChatMessage key={m.id} msg={m} />)}
                                            </div>
                                        </div>
                                    }

                                    {!chatLoading && !chatError &&
                                        <div className="chat-input-area">
                                            <textarea
                                                ref={inputRef}
                                                className="chat-input"
                                                placeholder="Задайте вопрос по игре..."
                                                value={input}
                                                maxLength={10000}
                                                onChange={(e) => { setInput(e.target.value); }}
                                                onKeyDown={handleKeyDown}
                                                rows={1}
                                                disabled={!game}
                                                aria-label="Текст сообщения"
                                            />
                                            <button
                                                className="btn send-btn"
                                                onClick={handleSend}
                                                disabled={sending || modelChanging || !input.trim() || !game}
                                                aria-label="Отправить"
                                                title="Отправить"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>
                        )}
                    </main>
                    {game && (
                        <button
                            className={`sidebar-toggle rules-toggle ${rulesSidebarOpen ? "hidden" : ""}`}
                            onClick={() => {
                                setRulesSidebarOpen(true);
                                setSidebarOpen(false);
                            }}
                            aria-label="Открыть правила"
                            title="Открыть правила"
                        >
                            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M12 6.90909C10.8999 5.50893 9.20406 4.10877 5.00119 4.00602C4.72513 3.99928 4.5 4.22351 4.5 4.49965C4.5 6.54813 4.5 14.3034 4.5 16.597C4.5 16.8731 4.72515 17.09 5.00114 17.099C9.20405 17.2364 10.8999 19.0998 12 20.5M12 6.90909C13.1001 5.50893 14.7959 4.10877 18.9988 4.00602C19.2749 3.99928 19.5 4.21847 19.5 4.49461C19.5 6.78447 19.5 14.3064 19.5 16.5963C19.5 16.8724 19.2749 17.09 18.9989 17.099C14.796 17.2364 13.1001 19.0998 12 20.5M12 6.90909L12 20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M19.2353 6H21.5C21.7761 6 22 6.22386 22 6.5V19.539C22 19.9436 21.5233 20.2124 21.1535 20.0481C20.3584 19.6948 19.0315 19.2632 17.2941 19.2632C14.3529 19.2632 12 21 12 21C12 21 9.64706 19.2632 6.70588 19.2632C4.96845 19.2632 3.64156 19.6948 2.84647 20.0481C2.47668 20.2124 2 19.9436 2 19.539V6.5C2 6.22386 2.22386 6 2.5 6H4.76471" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                    {game && (
                        <aside
                            className={`chat-sidebar rules-sidebar ${rulesSidebarOpen ? "open" : ""}`}
                            aria-hidden={!rulesSidebarOpen}
                        >
                            <div className="chat-sidebar-header">
                                <div className="chat-sidebar-actions">
                                    <button className="chat-sidebar-btn" onClick={() => setRulesSidebarOpen(false)} aria-label="Закрыть правила">
                                        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <path d="M12 6.90909C10.8999 5.50893 9.20406 4.10877 5.00119 4.00602C4.72513 3.99928 4.5 4.22351 4.5 4.49965C4.5 6.54813 4.5 14.3034 4.5 16.597C4.5 16.8731 4.72515 17.09 5.00114 17.099C9.20405 17.2364 10.8999 19.0998 12 20.5M12 6.90909C13.1001 5.50893 14.7959 4.10877 18.9988 4.00602C19.2749 3.99928 19.5 4.21847 19.5 4.49461C19.5 6.78447 19.5 14.3064 19.5 16.5963C19.5 16.8724 19.2749 17.09 18.9989 17.099C14.796 17.2364 13.1001 19.0998 12 20.5M12 6.90909L12 20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M19.2353 6H21.5C21.7761 6 22 6.22386 22 6.5V19.539C22 19.9436 21.5233 20.2124 21.1535 20.0481C20.3584 19.6948 19.0315 19.2632 17.2941 19.2632C14.3529 19.2632 12 21 12 21C12 21 9.64706 19.2632 6.70588 19.2632C4.96845 19.2632 3.64156 19.6948 2.84647 20.0481C2.47668 20.2124 2 19.9436 2 19.539V6.5C2 6.22386 2.22386 6 2.5 6H4.76471" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                                <h2 className="sidebar-title">Правила игры</h2>
                            </div>

                            <div className="chat-sessions-list">
                                <FileViewer
                                    fileType="pdf"
                                    fileTitle={game?.rulesFileTitle}
                                    isPrintTitle={false}
                                />
                            </div>
                        </aside>
                    )}
                </div >
            )}

            {
                confirmState.open && (
                    <Modal onClose={() => setConfirmState({ open: false })}>
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