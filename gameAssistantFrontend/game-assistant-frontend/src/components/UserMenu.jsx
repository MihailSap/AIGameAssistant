import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { fileApi } from "../api/file";

import "../css/MainPage.css";
import "../css/UserMenu.css";

export default function UserMenu({ currentUser }) {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [avatarBlobUrl, setAvatarBlobUrl] = useState(null);
  const mountedRef = useRef(true);
  const blobRef = useRef(null);

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

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (blobRef.current && blobRef.current.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(blobRef.current);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Ошибка при revokeObjectURL:", err);
        }
        blobRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (blobRef.current && blobRef.current.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(blobRef.current);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Ошибка при revokeObjectURL перед новой загрузкой:", err);
      }
      blobRef.current = null;
    }
    setAvatarBlobUrl(null);

    const title = currentUser?.imageFileTitle;
    if (!title) return;

    let cancelled = false;

    (async () => {
      try {
        const blob = await fileApi.getImageBlob(title);
        if (cancelled) {
          const tmp = URL.createObjectURL(blob);
          try {
            URL.revokeObjectURL(tmp);
          } catch (_) {}
          return;
        }
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        if (mountedRef.current) {
          setAvatarBlobUrl(url);
        } else {
          try {
            URL.revokeObjectURL(url);
          } catch (_) {}
          blobRef.current = null;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Не удалось загрузить аватар через blob:", title, err);
        if (mountedRef.current) {
          setAvatarBlobUrl(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.imageFileTitle]);

  const firstLetter = (currentUser?.login || "U")[0].toUpperCase();

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

      {open && isAuthenticated && (
        <div className="user-popup">
          <div className="user-popup-header">
            <div className="user-popup-name">{currentUser?.login}</div>
            <div className="user-popup-email">{currentUser?.email}</div>
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
