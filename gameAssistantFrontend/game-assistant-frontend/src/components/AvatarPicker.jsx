import React, { useEffect, useRef, useState } from "react";

import "../css/ProfilePage.css";
import "../css/AvatarPicker.css";

export default function AvatarPicker({ initialUrl = null, onSelectFile }) {
  const [preview, setPreview] = useState(initialUrl);
  const inputRef = useRef(null);
  const lastBlobRef = useRef(null);

  useEffect(() => {
    setPreview(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    return () => {
      if (lastBlobRef.current && lastBlobRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(lastBlobRef.current);
        lastBlobRef.current = null;
      }
    };
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой (макс 5MB)");
      return;
    }
    const url = URL.createObjectURL(f);
    if (lastBlobRef.current && lastBlobRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(lastBlobRef.current);
    }
    lastBlobRef.current = url;
    setPreview(url);
    if (typeof onSelectFile === "function") onSelectFile(f);
  };

  const trigger = () => inputRef.current?.click();

  return (
    <div className="avatar-picker">
      <div className="avatar-preview" aria-hidden={!preview}>
        {preview ? (
          <img src={preview} alt="Аватар пользователя" />
        ) : (
          <div className="avatar-placeholder">Нет фото</div>
        )}
      </div>

      <div className="avatar-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={onFileChange}
        />
        <button type="button" className="btn btn-ghost" onClick={trigger}>
          Изменить фотографию
        </button>
      </div>
    </div>
  );
}
