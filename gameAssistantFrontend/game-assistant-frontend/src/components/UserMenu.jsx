import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { fileApi } from "../api/file";
import useBlobUrl from "../hooks/useBlobUrl";
import "../css/MainPage.css";
import "../css/UserMenu.css";
import { useTheme } from "../contexts/ThemeContext";

export default function UserMenu({ currentUser }) {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { url: avatarBlobUrl } = useBlobUrl(fileApi.getImageBlob, currentUser?.imageFileTitle, [currentUser?.imageFileTitle]);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const firstLetter = (currentUser?.login || "U")[0].toUpperCase();

  const { mode, setMode, currentTheme } = useTheme();

  return (
    <div className="user-menu-root" ref={ref}>
      {isAuthenticated ? (
        <button
          className="user-icon"
          onClick={() => setOpen((v) => !v)}
          aria-label="User menu"
          type="button"
        >
          <span className="user-avatar">
            {avatarBlobUrl ? (
              <img src={avatarBlobUrl} alt={currentUser?.login || "avatar"} className="user-avatar-img" />
            ) : (
              firstLetter
            )}
          </span>
        </button>
      ) : (
        <div className="auth-links">
          <Link to="/login" className="link">Вход</Link>
          <Link to="/register" className="link">Регистрация</Link>
        </div>
      )}

      {isAuthenticated && (
        <div className={`user-popup ${open ? "is-open" : "is-closing"}`} role="dialog" aria-hidden={!open}>
          <div className="user-popup-header">
            <div className="user-popup-name">{currentUser?.login}</div>
            <div className="user-popup-email">{currentUser?.email}</div>
          </div>

          <div className="user-popup-section">
            <div className="theme-label">Тема</div>
            <div className="theme-switch" role="radiogroup" aria-label="Выбор темы">
              <button
                className={`theme-btn ${mode === "auto" ? "active" : ""}`}
                onClick={() => setMode("auto")}
                role="radio"
                aria-checked={mode === "auto"}
                title={`Авто (система: ${currentTheme})`}
                type="button"
              >
                Авто
              </button>
              <button
                className={`theme-btn ${mode === "dark" ? "active" : ""}`}
                onClick={() => setMode("dark")}
                role="radio"
                aria-checked={mode === "dark"}
                title="Тёмная"
                type="button"
              >
                Тёмная
              </button>
              <button
                className={`theme-btn ${mode === "light" ? "active" : ""}`}
                onClick={() => setMode("light")}
                role="radio"
                aria-checked={mode === "light"}
                title="Светлая"
                type="button"
              >
                Светлая
              </button>
            </div>
          </div>

          <div className="user-popup-actions">
            <Link to="/profile" className="user-popup-btn">Личный кабинет</Link>
            <button className="user-popup-btn" onClick={logout}>Выйти</button>
          </div>
        </div>
      )}
    </div>
  );
}
