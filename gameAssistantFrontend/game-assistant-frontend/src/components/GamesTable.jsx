import React from "react";
import "../css/AdminPage.css";
import "../css/AdminTable.css";

export default function GamesTable({ games = [], onEdit, onDelete, onDownloadFile, onOpenFile, currentPage, pageCount, setPage }) {
    return (
        <div>
            <div className="table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Описание</th>
                            <th>Изображение</th>
                            <th>Правила</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map((g, idx) => (
                            <tr key={g.id ?? idx}>
                                <td>{g.id}</td>
                                <td>{g.title.length > 20 ? g.title.slice(0, 20) + "…" : g.title}</td>
                                <td>{g.categories.join(', ').length > 40 ? g.categories.join(', ').slice(0, 40) + "…" : g.categories.join(', ')}</td>
                                <td>{g.description ? (g.description.length > 40 ? g.description.slice(0, 40) + "…" : g.description) : "-"}</td>
                                <td>
                                    {g.imageFileTitle ? (
                                        <button
                                            className="link-btn"
                                            onClick={() => onOpenFile ? onOpenFile("image", g.imageFileTitle) : onDownloadFile("image", g.imageFileTitle)}
                                        >
                                            {g.imageFileTitle.slice(14).length > 30 ? g.imageFileTitle.slice(14).slice(0, 30) + "…" : g.imageFileTitle.slice(14)}
                                        </button>
                                    ) : "-"}
                                </td>
                                <td>
                                    {g.rulesFileTitle ? (
                                        <button
                                            className="link-btn"
                                            onClick={() => onOpenFile ? onOpenFile("pdf", g.rulesFileTitle) : onDownloadFile("pdf", g.rulesFileTitle)}
                                        >
                                            {g.rulesFileTitle.slice(14).length > 30 ? g.rulesFileTitle.slice(14).slice(0, 30) + "…" : g.rulesFileTitle.slice(14)}
                                        </button>
                                    ) : "-"}
                                </td>
                                <td>
                                    <button className="icon-btn" onClick={() => onEdit(g)} title="Редактировать">✎</button>
                                    <button className="icon-btn danger" onClick={() => onDelete(g)} title="Удалить">X</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="table-pagination">
                <button
                    className="btn pagination-btn"
                    disabled={currentPage <= 1 || pageCount <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                    ←
                </button>

                <div className="pagination-indicator">{currentPage} / {pageCount}</div>

                <button
                    className="btn pagination-btn"
                    disabled={currentPage >= pageCount || pageCount <= 1}
                    onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                >
                    →
                </button>
            </div>
        </div>
    );
}
