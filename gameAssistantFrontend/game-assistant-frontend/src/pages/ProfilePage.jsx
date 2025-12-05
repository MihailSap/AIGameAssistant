import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Header from "../components/Header";
import { userApi } from "../api/users";
import { fileApi } from "../api/file";
import { chatApi } from "../api/chat";
import { gameApi } from "../api/game";
import AvatarControl from "../components/AvatarControl";
import SelectDropdown from "../components/SelectDropdown";
import { formatDate } from "../utils/utils";
import useBlobUrl from "../hooks/useBlobUrl";
import { createObjectUrl, revokeObjectUrl } from "../utils/blobUtils";
import { motion, AnimatePresence } from "framer-motion";
import "../css/ProfilePage.css";

export default function ProfilePage() {
  const { userInfo: authUser } = useAuth() || {};
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(authUser || null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarErrorSet, setAvatarErrorSet] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [pwErrors, setPwErrors] = useState({ short: "", diff: "", general: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [visibleCount, setVisibleCount] = useState(8);

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsGames, setChatsGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  const mountedRef = useRef(true);

  const { url: avatarBlobUrl, loading: avatarLoadingFetch, error: avatarGetError, revoke: revokeAvatar, refresh: refreshAvatar } =
    useBlobUrl(fileApi.getImageBlob, currentUser?.imageFileTitle, [currentUser?.imageFileTitle]);

  useEffect(() => {
    mountedRef.current = true;
    const loadProfile = async () => {
      setLoading(true);
      setGlobalError(null);
      if (!mountedRef.current) return;
      try {
        const auth = await userApi.getAuthenticated();
        setCurrentUser(auth || null);
      } catch (err) {
        setGlobalError(err?.response?.data?.message || err?.message || "Не удалось загрузить данные пользователя");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      mountedRef.current = false;
      if (avatarPreviewUrl) revokeObjectUrl(avatarPreviewUrl);
      revokeAvatar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPwErrors({ short: "", diff: "", general: "" });
    if (!newPassword && !repeatPassword) return;
    if (newPassword.length > 0 && (newPassword.length < 4 || newPassword.length > 30)) {
      setPwErrors(prev => ({ ...prev, short: "Слишком короткий пароль" }));
    }
    if (repeatPassword.length > 0 && newPassword !== repeatPassword) {
      setPwErrors(prev => ({ ...prev, diff: "Пароли не совпадают" }));
    }
  }, [newPassword, repeatPassword]);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      let increment = 8;
      if (w < 950) increment = 5;
      else increment = 8;
      setVisibleCount(increment);
    };

    calc();

    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calc);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setChatsLoading(true);
      try {
        const resp = await chatApi.getChatPreviewsByUser();
        if (!mounted) return;
        const arr = Array.isArray(resp) ? resp : [];
        arr.sort((a, b) => (b.lastUseTime ? new Date(b.lastUseTime) : new Date()) - (a.lastUseTime ? new Date(a.lastUseTime) : new Date()));
        const chats = await Promise.all(arr.map(async chat => {
          if (chat.gameId) {
            const game = await gameApi.read(chat.gameId);
            return { ...chat, gameTitle: game.title };
          }
          return chat;
        }));
        setChats(chats);
        const chatsGames = [...(new Set(chats.map(c => c.gameTitle)))]
        setChatsGames(chatsGames);
      } catch (err) {
        setChats([]);
      } finally {
        if (mounted) setChatsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAvatarChange = async (file) => {
    if (!file) return;
    if (!currentUser?.id) {
      setAvatarErrorSet("Ошибка при изменении");
      return;
    }
    if (avatarPreviewUrl) {
      try { revokeObjectUrl(avatarPreviewUrl); } catch (_) { }
    }
    const localUrl = createObjectUrl(file);
    setAvatarPreviewUrl(localUrl);
    setAvatarErrorSet("");
    setAvatarUploading(true);
    try {
      const refreshed = await userApi.updateImage(currentUser.id, {
        email: currentUser.email ?? "",
        login: currentUser.login ?? "",
        password: "",
        isAdmin: currentUser.isAdmin ?? false,
        imageFile: file,
      });
      if (!mountedRef.current) {
        if (localUrl) {
          try { revokeObjectUrl(localUrl); } catch (_) { }
        }
        return;
      }
      setCurrentUser(refreshed || currentUser);
      if (!refreshed?.imageFileTitle) {
        setAvatarErrorSet("Ошибка при изменении");
        try { refreshAvatar(); } catch (_) { }
      }
    } catch (err) {
      if (avatarPreviewUrl) {
        try { revokeObjectUrl(avatarPreviewUrl); } catch (_) { }
        setAvatarPreviewUrl(null);
      }
      setAvatarErrorSet("Ошибка при изменении");
    } finally {
      if (mountedRef.current) setAvatarUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!currentUser?.id) {
      setAvatarErrorSet("Ошибка при изменении");
      return;
    }

    setAvatarUploading(true);
    setAvatarErrorSet("");

    try {
      const payload = {
        email: currentUser.email ?? "",
        login: currentUser.login ?? "",
        password: "",
        isAdmin: currentUser.isAdmin ?? false,
        imageFile: null,
      };

      try {
        await userApi.updateImage(currentUser.id, payload);
      } catch (err) {
        payload.imageFile = new Blob();
        await userApi.updateImage(currentUser.id, payload);
      }

      const refreshed = await userApi.getAuthenticated();
      if (mountedRef.current) {
        setCurrentUser(refreshed || null);
        setAvatarPreviewUrl(null);
        setAvatarErrorSet("");
      }
    } catch (err) {
      if (mountedRef.current) {
        setAvatarErrorSet("Ошибка при изменении");
      }
    } finally {
      if (mountedRef.current) setAvatarUploading(false);
    }
  };

  const canSubmitPassword = newPassword.length >= 4 && newPassword.length <= 30 && newPassword === repeatPassword && !isSubmitting;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitPassword) return;
    if (!currentUser?.id) {
      setPwErrors(prev => ({ ...prev, general: "Неизвестный пользователь — повторите вход." }));
      return;
    }
    setIsSubmitting(true);
    setPwErrors({ short: "", diff: "", general: "" });
    try {
      await userApi.updatePassword(currentUser.id, { newPassword });
      setNewPassword("");
      setRepeatPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setPwErrors(prev => ({ ...prev, general: err?.response?.data?.message || err?.message || "Не удалось сменить пароль" }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChatClick = (chat) => {
    if (!chat?.gameId || !chat?.id) return;
    navigate(`/games/ai/${chat.gameId}/${chat.id}`);
  };

  const visibleChats = chats.filter(c => !selectedGame || c.gameTitle === selectedGame).slice(0, visibleCount);

  const avatarUrl = avatarPreviewUrl || avatarBlobUrl;
  const avatarLoading = avatarLoadingFetch || avatarUploading;
  const avatarErrorGetText = avatarPreviewUrl || avatarUploading ? "" : (avatarGetError ? (avatarGetError?.response?.data?.message || avatarGetError?.message || "Ошибка при получении") : "");

  return (
    <div className="profile-root">
      <Header currentUser={currentUser} />

      {loading &&
        <div className="full-loader">
          <div className="spinner" />
        </div>
      }
      {globalError && <div className="loading-error" role="alert">{globalError}</div>}

      {!loading && (
        <div className="profile-grid">
          <div className="profile-left-column">
            <section className="profile-panel info-panel">
              <div className="profile-panel-inner">
                <h3 className="profile-panel-title">Основная информация</h3>
                <div className="profile-info-lines">
                  <div className="profile-info-line"><span className="profile-info-label">Почта:</span><span className="profile-info-value">{currentUser?.email || "—"}</span></div>
                  <div className="profile-info-line"><span className="profile-info-label">Логин:</span><span className="profile-info-value">{currentUser?.login || "—"}</span></div>
                </div>

                <div className="avatar-block">
                  <AvatarControl
                    url={avatarUrl}
                    loading={avatarLoading}
                    loadingText={avatarUploading ? "Отправка на сервер..." : "Загрузка изображения..."}
                    onSelectFile={handleAvatarChange}
                    onDelete={handleAvatarDelete}
                    showDelete={!!currentUser?.imageFileTitle}
                    errorGet={avatarErrorGetText}
                    errorSet={avatarErrorSet}
                  />
                </div>
              </div>
            </section>

            <section className="profile-panel security-panel">
              <div className="profile-panel-inner">
                <h3 className="profile-panel-title">Безопасность</h3>
                {!showPasswordForm ? (
                  <button className="security-toggle" onClick={() => setShowPasswordForm(true)}>Сменить пароль</button>
                ) : (
                  <form className="password-form" onSubmit={handlePasswordSubmit} noValidate>
                    <label className="password-row">
                      <input
                        type="password"
                        placeholder="Введите новый пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="profile-input"
                        aria-invalid={!!pwErrors.short}
                      />
                      {pwErrors.short && <div className="profile-field-error">{pwErrors.short}</div>}
                    </label>

                    <label className="password-row">
                      <input
                        type="password"
                        placeholder="Повторите новый пароль"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="profile-input"
                        aria-invalid={!!pwErrors.diff}
                      />
                      {pwErrors.diff && <div className="profile-field-error">{pwErrors.diff}</div>}
                    </label>

                    {pwErrors.general && <div className="profile-field-error">{pwErrors.general}</div>}

                    <button type="submit" className="btn btn-green" disabled={!canSubmitPassword}>
                      {isSubmitting ? "Смена..." : "Сменить пароль"}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>

          <aside className="profile-right-column">
            <section className="profile-panel chats-panel">
              <div className="profile-panel-inner">
                <div className="profile-chats-header">
                  <SelectDropdown fetchItems={() => chatsGames} value={selectedGame} onChange={(v) => setSelectedGame(v)} allowNull={true} placeholder="Все игры" />
                  <h3 className="profile-panel-title">Последние чаты</h3>
                </div>
                {chatsLoading ? (
                  <div className="profile-message">Загрузка...</div>
                ) : (
                  <>
                    {(!chats || chats.length === 0) ? (
                      <div className="profile-empty-note">У вас ещё нет чатов</div>
                    ) : (
                      <ul className="profile-chats-list">
                        <AnimatePresence mode="popLayout" initial={false}>
                          {visibleChats.map((c) => (
                            <motion.li
                              key={c.id}
                              layout
                              layoutId={`chat-${c.id}`}
                              className="profile-chat-item"
                              initial={{ opacity: 0, y: 8, scale: 0.995 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.995 }}
                              transition={{
                                opacity: { duration: 0.22 },
                                y: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] },
                                scale: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] },
                                layout: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }
                              }}
                              onClick={() => handleChatClick(c)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === "Enter" && handleChatClick(c)}
                            >
                              <div className="profile-chat-game">{c.gameTitle || "—"}</div>
                              <div className="profile-chat-title">{c.title || "—"}</div>
                              <div className="profile-chat-time">{formatDate(c.lastUseTime)}</div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </>
                )}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
