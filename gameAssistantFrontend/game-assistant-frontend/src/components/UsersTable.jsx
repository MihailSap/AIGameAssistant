import React from "react";
import "../css/AdminPage.css";
import "../css/AdminTable.css";

export default function UsersTable({ users = [], currentUser = null, onDelete, onEnabled, onToggleAdmin, currentPage, pageCount, setPage }) {
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
            {users.map((u, idx) => {
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
                    {!u.isEnabled &&
                      <button className="icon-btn" onClick={() => onEnabled(u)} title="Подтвердить почту">✔</button>
                    }
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
