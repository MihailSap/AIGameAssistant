import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { userApi } from "../api/users";
import { gameApi } from "../api/game";
import { fileApi } from "../api/file";
import UsersTable from "../components/UsersTable";
import GamesTable from "../components/GamesTable";
import FileViewer from "../components/FileViewer";
import Modal from "../components/Modal";
import GameForm from "../components/GameForm";
import PromptEditor from "../components/PromptEditor";
import "../css/AdminPage.css";
import { downloadBlob } from "../utils/blobUtils";

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [usersSearch, setUsersSearch] = useState("");
  const [gamesSearch, setGamesSearch] = useState("");

  const [viewerState, setViewerState] = useState({ open: false, fileType: null, fileTitle: null });
  const [confirmState, setConfirmState] = useState({ open: false, text: "", onConfirm: null });
  const [gameFormState, setGameFormState] = useState({ open: false, mode: "create", initial: null });

  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const authUser = await userApi.getAuthenticated();
        if (!mounted) return;

        if (!authUser?.isAdmin) {
          navigate("/", { replace: true });
          return;
        }

        setCurrentUser(authUser);

        const [allUsers, allGames] = await Promise.all([userApi.getAll(), gameApi.getAll()]);
        if (!mounted) return;

        if (allGames && allGames.length > 0) {
          const gamesResults = (await Promise.all(
            allGames.map(item => gameApi.read(item.id))
          )).sort((a, b) => a?.id - b?.id);
          setGames(gamesResults);
        } else {
          setGames(allGames || []);
        }

        const others = (allUsers || []).filter(u => u.id !== authUser.id);
        const admins = others
          .filter(u => u.isAdmin)
          .sort((a, b) => a?.id - b?.id);
        const regulars = others
          .filter(u => !u.isAdmin)
          .sort((a, b) => a?.id - b?.id);
        setUsers([authUser, ...admins, ...regulars]);
        setError(null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Ошибка при загрузке данных");
        if (err?.response?.status === 401) navigate("/login", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const refreshData = async () => {
    try {
      const [allUsers, allGames] = await Promise.all([userApi.getAll(), gameApi.getAll()]);

      if (allGames && allGames.length > 0) {
        const gamesResults = (await Promise.all(
          allGames.map(item => gameApi.read(item.id))
        )).sort((a, b) => a?.id - b?.id);
        setGames(gamesResults);
      } else {
        setGames(allGames || []);
      }

      const authUser = await userApi.getAuthenticated();
      const others = (allUsers || []).filter(u => u.id !== authUser.id);
      const admins = others
        .filter(u => u.isAdmin)
        .sort((a, b) => a?.id - b?.id);
      const regulars = others
        .filter(u => !u.isAdmin)
        .sort((a, b) => a?.id - b?.id);
      setUsers([authUser, ...admins, ...regulars]);
      setCurrentUser(authUser);
    } catch (err) {
      console.error("refresh error", err);
    }
  };

  const handleDeleteUser = (user) => {
    setConfirmState({
      open: true,
      text: `Вы уверены, что хотите удалить пользователя "${user.login}" (${user.email})? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await userApi.delete(user.id);
          setConfirmState({ open: false });
          if (currentUser && user.id === currentUser.id) {
            await logout();
            navigate("/login", { replace: true });
            return;
          }
          await refreshData();
        } catch (err) {
          alert("Не удалось удалить пользователя.");
          setConfirmState({ open: false });
        }
      },
    });
  };

  const handleToggleAdmin = async (user, checked) => {
    if (!user || user.id == null) return;
    const current = Boolean(user.isAdmin);
    if (checked === current) return;

    try {
      if (checked) {
        await userApi.makeAdmin(user.id);
      } else {
        await userApi.makeNotAdmin(user.id);
      }
      if (currentUser && user.id === currentUser.id) {
        navigate("/");
        return;
      }
      await refreshData();
    } catch (err) {
      console.error("Ошибка при смене роли:", err);
    }
  };

  const handleOpenViewer = (fileType, fileTitle) => {
    if (!fileTitle) return;
    setViewerState({ open: true, fileType, fileTitle });
  };

  const handleOpenCreateGame = () => {
    setGameFormState({ open: true, mode: "create", initial: null });
  };

  const handleOpenEditGame = (game) => {
    setGameFormState({ open: true, mode: "edit", initial: game });
  };

  const handleDeleteGame = (game) => {
    setConfirmState({
      open: true,
      text: `Вы действительно хотите удалить игру "${game.title}"? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await gameApi.delete(game.id);
          setConfirmState({ open: false });
          await refreshData();
        } catch (err) {
          alert("Не удалось удалить игру.");
          setConfirmState({ open: false });
        }
      },
    });
  };

  const handleDownloadFile = async (fileType, fileTitle) => {
    try {
      if (!fileTitle) return;
      let blob;
      if (fileType === "image") {
        blob = await fileApi.getImageBlob(fileTitle);
      } else {
        blob = await fileApi.getRulesBlob(fileTitle);
      }
      await downloadBlob(blob, fileTitle);
    } catch (err) {
      alert("Не удалось скачать файл.");
    }
  };

  const handleGameFormSave = async (formData, mode, id) => {
    try {
      if (mode === "create") {
        await gameApi.create(formData);
      } else {
        await gameApi.update(id, formData);
      }
      setGameFormState({ open: false, mode: "create", initial: null });
      await refreshData();
    } catch (err) {
      alert("Ошибка при сохранении игры.");
    }
  };

  if (loading) {
    return (
      <div className="admin-root">
        <div className="admin-header">
          <h1>Админская панель</h1>
        </div>
        {loading && (
          <div className="full-loader">
            <div className="spinner" />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-root">
        <div className="admin-header">
          <h1>Админская панель</h1>
          <Link to="/" className="main-link">На главную</Link>
        </div>
        <div className="loading-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Админская панель</h1>
          <nav className="admin-tabs" role="tablist" aria-label="Админ вкладки">
            <button
              type="button"
              className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
              role="tab"
              aria-selected={activeTab === "users"}
            >
              Пользователи
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === "games" ? "active" : ""}`}
              onClick={() => setActiveTab("games")}
              role="tab"
              aria-selected={activeTab === "games"}
            >
              Игры
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
              role="tab"
              aria-selected={activeTab === "settings"}
            >
              Настройки
            </button>
          </nav>
        </div>

        <div className="admin-header-right">
          <Link to="/" className="link main-link">На главную</Link>
          <button className="btn admin-btn-logout" onClick={logout}>Выйти</button>
        </div>
      </header>

      <main className="admin-main">
        {activeTab === "settings" && (
          <section className="admin-section">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Промпт</h2>
            </div>
            <PromptEditor />
          </section>
        )}

        {activeTab === "users" && (
          <section className="admin-section">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Пользователи</h2>
              <div className="admin-table-controls">
                <input
                  type="text"
                  className="admin-table-search users-search"
                  placeholder="Поиск пользователей..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                />
              </div>
            </div>
            <UsersTable
              users={users}
              currentUser={currentUser}
              onDelete={handleDeleteUser}
              onToggleAdmin={handleToggleAdmin}
              search={usersSearch}
            />
          </section>
        )}

        {activeTab === "games" && (
          <section className="admin-section">
            <div className="admin-table-header">
              <h2 className="admin-table-title">Игры</h2>
              <div className="admin-table-controls">
                <input
                  type="text"
                  className="admin-table-search games-search"
                  placeholder="Поиск игр..."
                  value={gamesSearch}
                  onChange={(e) => setGamesSearch(e.target.value)}
                />
                <button className="btn admin-btn-add" onClick={handleOpenCreateGame} title="Добавить игру">＋</button>
              </div>
            </div>

            <GamesTable
              games={games}
              onEdit={handleOpenEditGame}
              onDelete={handleDeleteGame}
              onDownloadFile={handleDownloadFile}
              onOpenFile={handleOpenViewer}
              search={gamesSearch}
            />
          </section>
        )}
      </main>

      {confirmState.open && (
        <Modal onClose={() => setConfirmState({ open: false })}>
          <p>{confirmState.text}</p>
          <div className="admin-modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmState({ open: false })}>Отмена</button>
            <button className="btn btn-danger" onClick={confirmState.onConfirm}>Удалить</button>
          </div>
        </Modal>
      )}

      {gameFormState.open && (
        <Modal onClose={() => setGameFormState({ open: false })}>
          <GameForm
            mode={gameFormState.mode}
            initial={gameFormState.initial}
            onCancel={() => setGameFormState({ open: false })}
            onSave={handleGameFormSave}
          />
        </Modal>
      )}

      {viewerState.open && (
        <Modal onClose={() => setViewerState({ open: false, fileType: null, fileTitle: null })}>
          <FileViewer
            fileType={viewerState.fileType}
            fileTitle={viewerState.fileTitle}
          />
        </Modal>
      )}
    </div>
  );
}
