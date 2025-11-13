import React, { useEffect, useMemo, useState } from "react";
import "../css/AdminPage.css";
import "../css/AdminTable.css";

const PAGE_SIZE = 10;

export default function UsersTable({ users = [], currentUser = null, onDelete, onToggleAdmin, search = "" }) {
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = (search || "").trim();
    if (q.length < 2) return users;
    const qq = q.toLowerCase();
    return users.filter(u => (u.login || "").toLowerCase().includes(qq) || (u.email || "").toLowerCase().includes(qq));
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 0) / PAGE_SIZE));
  useEffect(() => {
    setPage((p) => {
      const next = 1;
      return next;
    });
  }, [search, users]);

  const start = (page - 1) * PAGE_SIZE;
  const pageSlice = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Логин</th>
              <th>Email</th>
              <th>Админ</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((u, idx) => {
              const isCurrent = currentUser && u.id === currentUser.id;
              const rowClass = isCurrent ? "row-current" : (u.isAdmin ? "row-admin" : "");
              return (
                <tr key={u.id ?? idx} className={rowClass}>
                  <td>{u.id}</td>
                  <td>{u.login.length > 20 ? u.login.slice(0, 20) + "…" : u.login}</td>
                  <td>{u.email.length > 40 ? u.email.slice(0, 40) + "…" : u.email}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!u.isAdmin}
                      onChange={(e) => onToggleAdmin(u, e.target.checked)}
                      aria-label={`isAdmin-${u.id}`}
                    />
                  </td>
                  <td>
                    <button className="icon-btn danger" onClick={() => onDelete(u)} title="Удалить пользователя">X</button>
                  </td>
                </tr>
              );
            })}
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
