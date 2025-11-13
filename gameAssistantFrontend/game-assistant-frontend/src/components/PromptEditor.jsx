import React, { useEffect, useRef, useState } from "react";
import { promptApi } from "../api/prompt";
import "../css/PromptEditor.css";

export default function PromptEditor() {
    const [promptObj, setPromptObj] = useState(null);
    const [draft, setDraft] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);

    function findTextKey(obj) {
        if (!obj || typeof obj !== "object") return "text";
        const keys = Object.keys(obj);
        for (let k of keys) {
            if (k === "id") continue;
            const v = obj[k];
            if (typeof v === "string" && v.length > 0) return k;
        }
        return "text";
    }

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const dto = await promptApi.get();
                if (!mounted) return;
                setPromptObj(dto || {});
                const key = findTextKey(dto);
                setDraft((dto && dto[key]) || "");
                setError(null);
            } catch (err) {
                setPromptObj({});
                setDraft("");
                setError("Ошибка при загрузке промпта");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
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
        const key = findTextKey(promptObj);
        setDraft((promptObj && promptObj[key]) || "");
        setIsEditing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const key = findTextKey(promptObj);
            const payload = { ...(promptObj || {}) };
            payload[key] = draft;
            const updated = await promptApi.update(payload);
            setPromptObj(updated || payload);
            const newKey = findTextKey(updated || payload);
            setDraft((updated && updated[newKey]) || payload[newKey] || "");
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
            {(!loading ) &&
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
            }

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