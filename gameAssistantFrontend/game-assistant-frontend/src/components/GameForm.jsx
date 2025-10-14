import React, { useState } from "react";
import "../css/AdminPage.css";
import "../css/GameForm.css";

export default function GameForm({ mode = "create", initial = null, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [imageFile, setImageFile] = useState(null);
  const [rulesFile, setRulesFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { title, description };
      if (imageFile) payload.imageFile = imageFile;
      if (rulesFile) payload.rulesFile = rulesFile;

      await onSave(payload, mode, initial?.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="game-form" onSubmit={handleSubmit}>
      <label className="form-row">
        <span className="form-label">Название</span>
        <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30} required />
      </label>

      <label className="form-row">
        <span className="form-label">Описание</span>
        <textarea className="form-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1500} />
      </label>

      <label className="form-row">
        <span className="form-label">Изображение</span>
        <input
          className="form-input"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files && e.target.files[0])}
          required={initial == null}
        />
        {initial?.imageFileTitle && !imageFile && (
          <div className="file-note">Текущее: {initial.imageFileTitle.slice(14).length > 30 ? initial.imageFileTitle.slice(14).slice(0, 30) + "…" : initial.imageFileTitle.slice(14)}</div>
        )}
      </label>

      <label className="form-row">
        <span className="form-label">Правила</span>
        <input
          className="form-input"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md,.rtf"
          onChange={(e) => setRulesFile(e.target.files && e.target.files[0])}
          required={initial == null}
        />
        {initial?.rulesFileTitle && !rulesFile && (
          <div className="file-note">Текущее: {initial.rulesFileTitle.slice(14).length > 30 ? initial.rulesFileTitle.slice(14).slice(0, 30) + "…" : initial.rulesFileTitle.slice(14)}</div>
        )}
      </label>

      <div className="admin-modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Отмена</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Сохранение..." : mode === "create" ? "Создать" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
