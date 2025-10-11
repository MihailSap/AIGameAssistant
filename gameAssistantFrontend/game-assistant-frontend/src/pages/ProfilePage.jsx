// src/pages/ProfilePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { userApi } from "../api/users";
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
  const mountedRef = useRef(true);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatarUrl || null);

  useEffect(() => {
    mountedRef.current = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const resp = await userApi.getAuthenticated();
        if (!mountedRef.current) return;
        setUser(resp || null);
        if (resp && resp.avatarUrl) setAvatarUrl(resp.avatarUrl);
        setError(null);
      } catch (err) {
        console.warn(err);
        setError(err?.response?.data?.message || err?.message || "Не удалось загрузить данные пользователя");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetch();
    return () => {
      mountedRef.current = false;
      if (avatarUrl && avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  useEffect(() => {
    setPwError("");
    setShortPwError("");
    setDiffPwError("");
    if (!newPassword && !repeatPassword) {
      setPwError("");
      setShortPwError("");
      setDiffPwError("");
      return;
    }
    if (newPassword.length > 0 && (newPassword.length < 4 || newPassword.length > 30)) {
      setShortPwError("Пароль должен быть не менее 4-х символов");
      return;
    }
    if (repeatPassword.length > 0 && newPassword !== repeatPassword) {
      setDiffPwError("Пароли не совпадают");
      return;
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
    try {
      await userApi.updatePassword(user.id, { newPassword: newPassword });
      setNewPassword("");
      setRepeatPassword("");
      setSuccessChangePw("Пароль успешно изменён");
    } catch (err) {
      console.error(err);
      setPwError("Не удалось сменить пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelect = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (avatarUrl && avatarUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarUrl);
    }
    setAvatarUrl(url);
    setAvatarFile(file);

    // TODO: upload to server if endpoint exists, then set server-provided URL
  };

  return (
    <div className="profile-root">
      <div className="profile-top">
        <Link to="/" className="link-like">← На главную</Link>
        <h1 className="profile-title">Личный кабинет</h1>
      </div>

      {loading && <div className="profile-message">Загрузка...</div>}
      {error && <div className="profile-error">{error}</div>}

      {!loading && user && (
        <>
          <div className="profile-grid">
            <section className="profile-panel profile-panel-left">
              <div className="profile-panel-inner">
                <h2 className="profile-section-title small">Профиль</h2>
                <AvatarPicker initialUrl={avatarUrl} onSelectFile={handleAvatarSelect} />

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
                  {successChangePw && <div className="profile-success-note" role="alert">{successChangePw}</div>}

                  <div className="profile-password-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
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
