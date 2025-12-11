import React, { useEffect, useRef, useState } from "react";
import { promptApi } from "../api/prompt";
import "../css/PromptEditor.css";

export default function PromptEditor() {
    const [original, setOriginal] = useState("");
    const [draft, setDraft] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const text = await promptApi.get();
                if (!mounted) return;
                const str = typeof text === "string" ? text : "";
                setOriginal(str);
                setDraft(str);
                setError(null);
            } catch (err) {
                if (!mounted) return;
                setOriginal("");
                setDraft("");
                setError("Ошибка при загрузке промпта");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            const val = textareaRef.current.value;
            textareaRef.current.setSelectionRange(val.length, val.length);
        }
    }, [isEditing]);

    const handleActivate = () => {
        if (!isEditing) setIsEditing(true);
    };

    const handleCancel = () => {
        setDraft(original);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await promptApi.update(draft);
            const newText = typeof updated === "string" ? updated : draft;
            setOriginal(newText);
            setDraft(newText);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError("Ошибка при сохранении");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="prompt-editor-root">
            {!loading && (
                <textarea
                    ref={textareaRef}
                    className={`prompt-editor-textarea ${isEditing ? "editing" : "view"}`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onClick={handleActivate}
                    readOnly={!isEditing}
                    aria-label="Промпт для ассистента"
                    placeholder="Введите системный промпт..."
                />
            )}

            {isEditing && (
                <div className="prompt-editor-actions">
                    <button className="btn btn-danger" onClick={handleCancel} disabled={saving}>Отменить</button>
                    <button className="btn" onClick={handleSave} disabled={saving}>Сохранить</button>
                </div>
            )}

            {loading && <div className="prompt-editor-loading">Загрузка...</div>}
            {error && <div className="prompt-editor-error">{error}</div>}
        </div>
    );
}
