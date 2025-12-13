import React, { useEffect, useMemo, useState } from "react";
import "../css/AdminPage.css";
import "../css/AdminTable.css";

const PAGE_SIZE = 10;

export default function CategoriesTable({ categories = [], onAdd, onDelete }) {
    const [page, setPage] = useState(1);
    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);
    const [deletingIds, setDeletingIds] = useState(new Set());

    const totalPages = Math.max(1, Math.ceil((categories.length || 0) / PAGE_SIZE));

    useEffect(() => {
        setPage(1);
    }, [categories]);

    const start = (page - 1) * PAGE_SIZE;
    const pageSlice = useMemo(() => {
        return (categories || []).slice(start, start + PAGE_SIZE);
    }, [categories, start]);

    const handleAdd = async () => {
        const name = (newName || "").trim();
        if (!name) return;
        if (!onAdd) return;
        setAdding(true);
        try {
            await onAdd(name);
            setNewName("");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (cat) => {
        if (!onDelete) return;
        const id = cat && (cat.id ?? cat);
        setDeletingIds(prev => new Set(prev).add(id));
        try {
            await onDelete(cat);
        } finally {
            setDeletingIds(prev => {
                const copy = new Set(prev);
                copy.delete(id);
                return copy;
            });
        }
    };

    return (
        <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
                <input
                    className="admin-table-search category-input"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Новая категория"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                    style={{ flex: 1 }}
                    maxLength={100}
                />
                <button
                    className="btn admin-btn-add"
                    onClick={handleAdd}
                    disabled={adding || !(newName || "").trim()}
                    title="Добавить категорию"
                    aria-label="Добавить категорию"
                >
                    +
                </button>
            </div>

            <div className="table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Название</th>
                            <th>Количество игр</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageSlice.map((c, idx) => {
                            return (
                                <tr key={idx}>
                                    <td>{c.id}</td>
                                    <td>{c.name.length > 40 ? c.name.slice(0, 40) + "…" : c.name}</td>
                                    <td>{c.gamesCount}</td>
                                    <td>
                                        <button
                                            className="icon-btn danger"
                                            onClick={() => handleDelete(c)}
                                            disabled={deletingIds.has(c.id)}
                                            title="Удалить категорию"
                                            aria-label={`Удалить-${c.id}`}
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {pageSlice.length === 0 && (
                            <tr>
                                <td colSpan={3} style={{ textAlign: "center", padding: 16 }}>Пусто</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="table-pagination">
                <button
                    className="btn pagination-btn"
                    disabled={page <= 1 || totalPages <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                    ←
                </button>

                <div className="pagination-indicator">{page} / {totalPages}</div>

                <button
                    className="btn pagination-btn"
                    disabled={page >= totalPages || totalPages <= 1}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                    →
                </button>
            </div>
        </div>
    );
}
