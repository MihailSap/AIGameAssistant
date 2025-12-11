import React, { useState } from "react";
import "../css/AdminPage.css";
import "../css/GameForm.css";
import SelectDropdown from "../components/SelectDropdown";
import { categoryApi } from "../api/category";

export default function GameForm({ mode = "create", initial = null, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [imageFile, setImageFile] = useState(null);
  const [rulesFile, setRulesFile] = useState(null);
  const [categories, setCategories] = useState(initial?.categories ?? []);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!categories || categories.length === 0) {
        alert("Пожалуйста, выберите хотя бы одну категорию.");
        setSubmitting(false);
        return;
      }

      const payload = { title, description, categories };
      if (imageFile) payload.imageFile = imageFile;
      if (rulesFile) payload.rulesFile = rulesFile;

      await onSave(payload, mode, initial?.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="game-form" onSubmit={handleSubmit}>
      <h3 className="form-title">{mode === "create" ? "Создать игру" : "Редактировать игру"}</h3>

      <label className="form-row">
        <span className="form-label">Название</span>
        <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={30} required />
      </label>

      <label className="form-row">
        <span className="form-label">Категории</span>
        <div className="form-input">
          <SelectDropdown
            fetchItems={() => categoryApi.getAll().then(list => Array.isArray(list) ? list.map(c => c.name) : [])}
            cacheKey="categories"
            multiple={true}
            maxSelections={5}
            value={categories}
            onChange={(v) => setCategories(v)}
            placeholder="Категории"
          />
        </div>
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
          accept=".pdf"
          onChange={(e) => setRulesFile(e.target.files && e.target.files[0])}
          required={initial == null}
        />
        {initial?.rulesFileTitle && !rulesFile && (
          <div className="file-note">Текущее: {initial.rulesFileTitle.slice(14).length > 30 ? initial.rulesFileTitle.slice(14).slice(0, 30) + "…" : initial.rulesFileTitle.slice(14)}</div>
        )}
      </label>

      <div className="admin-modal-actions">
        <button type="button" className="btn btn-danger" onClick={onCancel} disabled={submitting}>Отмена</button>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Сохранение..." : mode === "create" ? "Создать" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}