import React, { useEffect, useState, useRef } from "react";
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
import useDebounce from "../hooks/useDebounce";

export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const skipNextPageEffect = useRef(false);
  const skipNextSearchEffect = useRef(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 280);
  const [selectedModel, setSelectedModel] = useState(null);
  const [viewerState, setViewerState] = useState({ open: false, fileType: null, fileTitle: null });
  const [confirmState, setConfirmState] = useState({ open: false, text: "", onConfirm: null, type: "delete" });
  const [gameFormState, setGameFormState] = useState({ open: false, mode: "create", initial: null });
  const [activeTab, setActiveTab] = useState("users");

  const loadData = async ({ tabToUse = "users", pageToUse = 1, searchToUse = "" } = {}) => {
    setItemsLoading(true);
    try {
      let data = null;
      if (tabToUse === "users") {
        data = await userApi.getAllPaged(pageToUse - 1, 10, (searchToUse || "").trim() || null);
        setItems(Array.isArray(data?.content) ? data.content : []);
      } else if (tabToUse === "games") {
        data = await gameApi.getAllPaged(pageToUse - 1, 10, (searchToUse || "").trim() || null, null, "id");
        const games = await Promise.all((data?.content || []).map(item => gameApi.read(item.id)));
        setItems(Array.isArray(games) ? games : []);

        const allCategories = await categoryApi.getAll();
        setCategories(allCategories.sort((a, b) => a?.id - b?.id) || []);
      } else if (tabToUse === "settings") {
        const currentModel = await modelApi.getMain();
        setSelectedModel(currentModel || "Yandex-GPT");
      }
      setPageCount(data?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Ошибка при загрузке данных");
    } finally {
      setItemsLoading(false);
    }
  };

  const refreshData = async (resetPage = false, overrideTab = undefined, overrideSearch = undefined) => {
    const tabToUse = overrideTab !== undefined ? overrideTab : activeTab;
    const searchToUse = overrideSearch !== undefined ? overrideSearch : debouncedSearch;
    const pageToUse = resetPage ? 1 : page;
    await loadData({ tabToUse, pageToUse, searchToUse });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshData(false, activeTab, debouncedSearch);
      if (!mounted) return;
    })();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (skipNextPageEffect.current) {
        skipNextPageEffect.current = false;
        return;
      }
      await refreshData(false);
      if (!mounted) return;
    })();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (skipNextSearchEffect.current) {
        skipNextSearchEffect.current = false;
        return;
      }
      setPage(1);
      setPageCount(1);
      await refreshData(true, undefined, debouncedSearch);
      if (!mounted) return;
    })();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const switchTab = async (tab) => {
    setActiveTab(tab);
    setItems([]);
    if (search !== "") {
      setSearch("");
      skipNextSearchEffect.current = true;
    }
    if (page !== 1) {
      setPage(1);
      skipNextPageEffect.current = true;
    }
    setPageCount(1);
    await refreshData(true, tab, "");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const authUser = await userApi.getAuthenticated();
        if (!mounted) return;
        if (!authUser?.isAdmin) {
          navigate("/", { replace: true });
          return;
        }
        setCurrentUser(authUser);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          setItems([]);
          if (page !== 1) {
            setPage(1);
            skipNextPageEffect.current = true;
          }
          await refreshData(true);
        } catch {
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
        } catch {
          alert("Не удалось подтвердить пользователя.");
          setConfirmState({ open: false });
        }
      },
      type: "confirm",
    });
  };

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
    } catch { }
  };

  const handleToggleAdmin = (user, checked) => {
    if (!user || user.id == null) return;
    const current = Boolean(user.isAdmin);
    if (checked === current) return;

    if (checked) {
      setConfirmState({
        open: true,
        text: `Вы действительно хотите сделать пользователя "${user.login}" (${user.email}) админом?`,
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
      text: `Вы действительно хотите удалить игру "${game.title}"?`,
      onConfirm: async () => {
        try {
          await gameApi.delete(game.id);
          setConfirmState({ open: false });
          setItems([]);
          if (page !== 1) {
            setPage(1);
            skipNextPageEffect.current = true;
          }
          await refreshData(true);
        } catch {
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
    } catch {
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
    } catch {
      alert("Ошибка при сохранении игры.");
    }
  };

  const handleAddCategory = async (name) => {
    try {
      const nm = (name || "").trim();
      if (!nm) return;
      await categoryApi.create(nm);
      await refreshData();
    } catch {
      alert("Не удалось добавить категорию.");
    }
  };

  const handleDeleteCategory = (cat) => {
    const id = cat && (cat.id ?? cat);
    setConfirmState({
      open: true,
      text: `Вы действительно хотите удалить категорию "${typeof cat === "string" ? cat : cat.name ?? ""}"?`,
      onConfirm: async () => {
        try {
          await categoryApi.delete(id);
          setConfirmState({ open: false });
          await refreshData();
        } catch {
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
    } catch {
      alert("Не удалось изменить модель.");
    }
  };

  if (loading) {
    return (
      <div className="admin-root">
        <div className="admin-header">
          <h1>Админская панель</h1>
        </div>
        <div className="full-loader">
          <div className="spinner" />
        </div>
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
              onClick={() => switchTab("users")}
              role="tab"
              aria-selected={activeTab === "users"}
            >
              Пользователи
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === "games" ? "active" : ""}`}
              onClick={() => switchTab("games")}
              role="tab"
              aria-selected={activeTab === "games"}
            >
              Игры
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => switchTab("settings")}
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {itemsLoading ? <div className="games-grid-loading"><div className="spinner grid" /></div> :
              <UsersTable
                users={items}
                currentUser={currentUser}
                onEnabled={handleEnableUser}
                onDelete={handleDeleteUser}
                onToggleAdmin={handleToggleAdmin}
                currentPage={page}
                pageCount={pageCount}
                setPage={setPage}
              />
            }
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn admin-btn-add" onClick={handleOpenCreateGame} title="Добавить игру">＋</button>
                </div>
              </div>
              {itemsLoading ? <div className="games-grid-loading"><div className="spinner grid" /></div> :
                <GamesTable
                  games={items}
                  onEdit={handleOpenEditGame}
                  onDelete={handleDeleteGame}
                  onDownloadFile={handleDownloadFile}
                  onOpenFile={handleOpenViewer}
                  currentPage={page}
                  pageCount={pageCount}
                  setPage={setPage}
                />
              }
            </section>
            <section className="admin-section">
              <div className="admin-table-header">
                <h2 className="admin-table-title">Категории</h2>
              </div>
              {itemsLoading ? <div className="games-grid-loading"><div className="spinner grid" /></div> :
                <CategoriesTable
                  categories={categories}
                  onAdd={handleAddCategory}
                  onDelete={handleDeleteCategory}
                />
              }
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
