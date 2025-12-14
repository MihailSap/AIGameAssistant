import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { userApi } from "../api/users";
import { gameApi } from "../api/game";
import { fileApi } from "../api/file";
import { modelApi } from "../api/model";
import { categoryApi } from "../api/category";
import UsersTable from "../components/UsersTable";
import GamesTable from "../components/GamesTable";
import CategoriesTable from "../components/CategoriesTable";
import FileViewer from "../components/FileViewer";
import Modal from "../components/Modal";
import GameForm from "../components/GameForm";
import PromptEditor from "../components/PromptEditor";
import SelectDropdown from "../components/SelectDropdown";
import "../css/AdminPage.css";
import { downloadBlob } from "../utils/blobUtils";
import { backendToFrontendModel } from "../utils/model";

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [usersSearch, setUsersSearch] = useState("");
  const [gamesSearch, setGamesSearch] = useState("");

  const [selectedModel, setSelectedModel] = useState(null);

  const [viewerState, setViewerState] = useState({ open: false, fileType: null, fileTitle: null });
  const [confirmState, setConfirmState] = useState({ open: false, text: "", onConfirm: null, type: "delete" });
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

        const currentModel = await modelApi.getMain();
        if (!mounted) return;
        setSelectedModel(currentModel || 'Yandex-GPT');

        const [allUsers, allGames, allCategories] = await Promise.all([userApi.getAll(), gameApi.getAll(), categoryApi.getAll()]);
        if (!mounted) return;

        setCategories(allCategories.sort((a, b) => a?.id - b?.id) || []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = async () => {
    try {
      const [allUsers, allGames, allCategories] = await Promise.all([userApi.getAll(), gameApi.getAll(), categoryApi.getAll()]);

      setCategories(allCategories.sort((a, b) => a?.id - b?.id) || []);

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
      type: "delete",
    });
  };

  const handleEnableUser = async (user) => {
    setConfirmState({
      open: true,
      text: `Вы уверены, что хотите подтвердить пользователя "${user.login}" с email "${user.email}"? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await userApi.forciblyConfirmUserEmail(user.id);
          setConfirmState({ open: false });
          await refreshData();
        } catch (err) {
          alert("Не удалось подтвердить пользователя.");
          setConfirmState({ open: false });
        }
      },
      type: "confirm",
    });
  }

  const applyAdminChange = async (user, checked) => {
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

  const handleToggleAdmin = (user, checked) => {
    if (!user || user.id == null) return;
    const current = Boolean(user.isAdmin);
    if (checked === current) return;

    if (checked) {
      setConfirmState({
        open: true,
        text: `Вы действительно хотите сделать пользователя "${user.login}" (${user.email}) админом? Он получит доступ ко всему функционалу админ-панели.`,
        onConfirm: async () => {
          await applyAdminChange(user, true);
          setConfirmState({ open: false });
        },
        type: "confirm",
      });
    } else {
      applyAdminChange(user, false);
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
      type: "delete",
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

  const handleAddCategory = async (name) => {
    try {
      const nm = (name || "").trim();
      if (!nm) return;
      await categoryApi.create(nm);
      await refreshData();
    } catch (err) {
      alert("Не удалось добавить категорию.");
    }
  };

  const handleDeleteCategory = (cat) => {
    const id = cat && (cat.id ?? cat);
    setConfirmState({
      open: true,
      text: `Вы действительно хотите удалить категорию "${typeof cat === "string" ? cat : (cat.name ?? "")}"? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await categoryApi.delete(id);
          setConfirmState({ open: false });
          await refreshData();
        } catch (err) {
          alert("Не удалось удалить категорию.");
          setConfirmState({ open: false });
        }
      },
      type: "delete",
    });
  };

  const handleChangeModel = async (newModel) => {
    try {
      if (!newModel) return;
      await modelApi.updateMain(newModel);
      setSelectedModel(newModel);
    } catch (err) {
      alert("Не удалось изменить модель.");
    }
  }

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
          <>
            <section className="admin-section">
              <div className="admin-table-header">
                <h2 className="admin-table-title">Модель по умолчанию</h2>
              </div>
              <SelectDropdown
                fetchItems={() => modelApi.getAll()}
                cacheKey="models"
                value={selectedModel}
                onChange={handleChangeModel}
                allowNull={false}
                placeholder="Выберите модель"
                ariaLabel="Модель нейросети"
                labelFunc={(m) => backendToFrontendModel(m)}
              />
            </section>
            <section className="admin-section">
              <div className="admin-table-header">
                <h2 className="admin-table-title">Промпт</h2>
              </div>
              <PromptEditor />
            </section>
          </>
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
              onEnabled={handleEnableUser}
              onDelete={handleDeleteUser}
              onToggleAdmin={handleToggleAdmin}
              search={usersSearch}
            />
          </section>
        )}

        {activeTab === "games" && (
          <>
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
            <section className="admin-section">
              <div className="admin-table-header">
                <h2 className="admin-table-title">Категории</h2>
              </div>
              <CategoriesTable
                categories={categories}
                onAdd={handleAddCategory}
                onDelete={handleDeleteCategory}
              />
            </section>
          </>
        )}
      </main>

      {confirmState.open && (
        <Modal onClose={() => setConfirmState({ open: false })}>
          <p>{confirmState.text}</p>
          <div className="admin-modal-actions">
            <button className="btn btn-ghost" onClick={() => setConfirmState({ open: false })}>Отмена</button>
            <button className={`btn ${confirmState.type === "delete" ? "btn-danger" : ""}`} onClick={confirmState.onConfirm}>{confirmState.type === "delete" ? "Удалить" : "Да"}</button>
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
