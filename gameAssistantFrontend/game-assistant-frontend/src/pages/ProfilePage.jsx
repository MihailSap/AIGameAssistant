import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { userApi } from "../api/users";
import { fileApi } from "../api/file";
import AvatarPicker from "../components/AvatarPicker";

import "../css/ProfilePage.css";

export default function ProfilePage() {
  const { userInfo: authUser } = useAuth() || {};
  const [user, setUser] = useState(authUser || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [shortPwError, setShortPwError] = useState("");
  const [diffPwError, setDiffPwError] = useState("");
  const [pwError, setPwError] = useState("");
  const [successChangePw, setSuccessChangePw] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const attemptedRef = useRef(false);
  const blobRef = useRef(null);
  const mountedRef = useRef(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const revokeBlobRef = () => {
    if (blobRef.current && typeof blobRef.current === "string" && blobRef.current.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(blobRef.current);
      } catch (revErr) {
        // eslint-disable-next-line no-console
        console.warn("Ошибка revokeObjectURL:", revErr);
      }
      blobRef.current = null;
    }
  };

  const makeBlobUrl = (blob) => {
    const url = URL.createObjectURL(blob);
    blobRef.current = url;
    return url;
  };

  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const auth = await userApi.getAuthenticated();
        if (!mountedRef.current) return;
        setUser(auth || null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Ошибка получения профиля:", err);
        setError(err?.response?.data?.message || err?.message || "Не удалось загрузить данные пользователя");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    load();

    return () => {
      mountedRef.current = false;
      revokeBlobRef();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    attemptedRef.current = false;
    revokeBlobRef();
    setAvatarUrl(null);

    const imageFileTitle = user?.imageFileTitle;
    setAvatarLoading(!!imageFileTitle);

    if (!imageFileTitle) {
      setAvatarLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      if (attemptedRef.current) return;
      attemptedRef.current = true;
      setAvatarLoading(true);

      try {
        const blob = await fileApi.getImageBlob(imageFileTitle);
        if (cancelled) {
          if (blob) {
            try {
              const tmp = URL.createObjectURL(blob);
              URL.revokeObjectURL(tmp);
            } catch (_) {
            }
          }
          return;
        }
        const url = makeBlobUrl(blob);
        if (mountedRef.current) {
          setAvatarUrl(url);
          setAvatarLoading(false);
          setError(null);
        } else {
          revokeBlobRef();
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Не удалось загрузить изображение через blob:", imageFileTitle, err);
        if (mountedRef.current) {
          setAvatarUrl(null);
          setAvatarLoading(false);
          setError(err?.response?.data?.message || err?.message || "Не удалось загрузить изображение профиля");
        }
      } finally {
        attemptedRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.imageFileTitle]);

  useEffect(() => {
    setPwError("");
    setShortPwError("");
    setDiffPwError("");

    if (!newPassword && !repeatPassword) return;

    if (newPassword.length > 0 && (newPassword.length < 4 || newPassword.length > 30)) {
      setShortPwError("Пароль должен быть не менее 4-х символов");
      return;
    }
    if (repeatPassword.length > 0 && newPassword !== repeatPassword) {
      setDiffPwError("Пароли не совпадают");
    }
  }, [newPassword, repeatPassword]);

  const canSubmitPassword = newPassword.length >= 4 && newPassword.length <= 30 && newPassword === repeatPassword && !isSubmitting;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmitPassword) return;
    if (!user || !user.id) {
      setPwError("Неизвестный пользователь — повторите вход.");
      return;
    }

    setIsSubmitting(true);
    setPwError("");
    setSuccessChangePw("");

    try {
      await userApi.updatePassword(user.id, { newPassword });
      setNewPassword("");
      setRepeatPassword("");
      setSuccessChangePw("Пароль успешно изменён");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Ошибка смены пароля:", err);
      setPwError(err?.response?.data?.message || err?.message || "Не удалось сменить пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelect = async (file) => {
    if (!file) {
      setError("Файл не выбран");
      return;
    }
    if (!user || !user.id) {
      setError("Неизвестный пользователь — обновление невозможно.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    revokeBlobRef();
    blobRef.current = localPreview;
    setAvatarUrl(localPreview);
    setError(null);

    setAvatarUploading(true);

    try {
      const refreshed = await userApi.updateImage(user.id, {
        email: user.email ?? "",
        login: user.login ?? "",
        password: "",
        isAdmin: user.isAdmin ?? false,
        imageFile: file,
      });

      if (!mountedRef.current) {
        if (localPreview && localPreview.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(localPreview);
          } catch (revErr) {
            // eslint-disable-next-line no-console
            console.warn("Ошибка revoke local preview после размонтирования:", revErr);
          }
        }
        return;
      }

      setUser(refreshed || null);

      if (!refreshed?.imageFileTitle) {
        setError("Аватар загружен, но сервер не вернул ссылку на изображение.");
      } else {
        setError(null);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Ошибка загрузки аватара на сервер:", err);
      if (localPreview && localPreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(localPreview);
        } catch (revErr) {
          // eslint-disable-next-line no-console
          console.warn("Ошибка освобождения локального preview после ошибки:", revErr);
        }
      }
      blobRef.current = null;
      setAvatarUrl(null);
      setError(err?.response?.data?.message || err?.message || "Не удалось загрузить аватар на сервер");
    } finally {
      if (mountedRef.current) setAvatarUploading(false);
    }
  };

  return (
    <div className="profile-root">
      <div className="profile-top">
        <Link to="/" className="link-like">← На главную</Link>
        <h1 className="profile-title">Личный кабинет</h1>
      </div>

      {loading && <div className="profile-message">Загрузка...</div>}
      {error && <div className="profile-error" role="alert">{error}</div>}

      {!loading && user && (
        <>
          <div className="profile-grid">
            <section className="profile-panel profile-panel-left">
              <div className="profile-panel-inner">
                <h2 className="profile-section-title small">Профиль</h2>

                <AvatarPicker
                  initialUrl={avatarUrl}
                  onSelectFile={handleAvatarSelect}
                  disabled={avatarUploading}
                  loading={avatarLoading || avatarUploading}
                  loadingText={avatarUploading ? "Отправка на сервер..." : "Загрузка изображения..."}
                />

                <div className="user-info">
                  <div className="user-field">
                    <div className="user-field-label">Логин</div>
                    <div className="user-field-value">{user.login || "—"}</div>
                  </div>

                  <div className="user-field">
                    <div className="user-field-label">Электронная почта</div>
                    <div className="user-field-value">{user.email || "—"}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="profile-panel profile-panel-right">
              <div className="profile-panel-inner">
                <h2 className="profile-section-title">Сменить пароль</h2>

                <form className="password-form" onSubmit={handlePasswordSubmit} noValidate>
                  <label className="profile-form-row">
                    <div className="user-field-label">Новый пароль</div>
                    <input
                      type="password"
                      maxLength={30}
                      value={newPassword}
                      onChange={(e) => {
                        if (successChangePw) setSuccessChangePw("");
                        setNewPassword(e.target.value);
                      }}
                      className="profile-input"
                      placeholder="Введите пароль"
                      aria-invalid={!!pwError}
                    />
                    {shortPwError && <span className="user-field-error">{shortPwError}</span>}
                  </label>

                  <label className="profile-form-row">
                    <div className="user-field-label">Повторите новый пароль</div>
                    <input
                      type="password"
                      maxLength={30}
                      value={repeatPassword}
                      onChange={(e) => {
                        if (successChangePw) setSuccessChangePw("");
                        setRepeatPassword(e.target.value);
                      }}
                      className="profile-input"
                      placeholder="Повторите пароль"
                      aria-invalid={!!pwError}
                    />
                    {diffPwError && <span className="user-field-error">{diffPwError}</span>}
                  </label>

                  {pwError && <div className="user-field-error" role="alert">{pwError}</div>}
                  {successChangePw && <div className="profile-success-note" role="status">{successChangePw}</div>}

                  <div className="profile-password-actions">
                    <button
                      type="submit"
                      className="btn"
                      disabled={!canSubmitPassword}
                    >
                      {isSubmitting ? "Сменяем..." : "Сменить"}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            <section className="profile-panel sessions-panel">
              <div className="profile-panel-inner">
                <h2 className="profile-section-title">Последние сессии с ИИ</h2>
                <div className="profile-sessions-placeholder">
                  <div className="profile-empty-note">История сессий пока отсутствует</div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
