import React, { useEffect, useRef, useState } from "react";
import { createObjectUrl, revokeObjectUrl } from "../utils/blobUtils";
import "../css/AvatarControl.css";

export default function AvatarControl({ url, loading, loadingText, onSelectFile, onDelete, showDelete = true, errorGet = "", errorSet = "" }) {
  const inputRef = useRef(null);
  const lastBlobRef = useRef(null);
  const [preview, setPreview] = useState(url);

  useEffect(() => {
    setPreview(url);
  }, [url]);

  useEffect(() => {
    return () => {
      if (lastBlobRef.current && typeof lastBlobRef.current === "string" && lastBlobRef.current.startsWith("blob:")) {
        try {
          revokeObjectUrl(lastBlobRef.current);
        } catch (_) { }
        lastBlobRef.current = null;
      }
    };
  }, []);

  const trigger = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой (макс 5MB)");
      return;
    }
    const urlLocal = createObjectUrl(f);
    if (lastBlobRef.current && typeof lastBlobRef.current === "string" && lastBlobRef.current.startsWith("blob:")) {
      try {
        revokeObjectUrl(lastBlobRef.current);
      } catch (_) { }
    }
    lastBlobRef.current = urlLocal;
    setPreview(urlLocal);
    if (typeof onSelectFile === "function") onSelectFile(f);
  };

  return (
    <div className="avatar-control">
      <div className={`avatar-wrap ${preview ? "has-img" : "no-img"}`}>
        {loading ? (
          <div className="avatar-loading">{loadingText || "Загрузка..."}</div>
        ) : errorGet ? (
          <div className="avatar-error">{errorGet}</div>
        ) : errorSet ? (
          <div className="avatar-error">{errorSet}</div>
        ) : preview ? (
          <img src={preview} alt="Аватар" className="avatar-img" />
        ) : (
          <div className="avatar-placeholder">Нет фото</div>
        )}

        <div className="avatar-overlay" aria-hidden>
          {showDelete && (
            <button type="button" className="avatar-btn avatar-btn-delete" title="Удалить фото" onClick={onDelete} aria-label="Удалить фото">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 11v6" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11v6" stroke="#ff4d4f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <button type="button" className="avatar-btn avatar-btn-edit" title="Изменить фото" onClick={trigger} aria-label="Изменить фото">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#f5c542" viewBox="0 0 16 16">
              <path d="
                M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 
                2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z
              " />
              <path d="
                M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 
                1.5 0 0 0 1 2.5v11z
              " />
            </svg>
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="visually-hidden" onChange={onFileChange} />
    </div>
  );
}
