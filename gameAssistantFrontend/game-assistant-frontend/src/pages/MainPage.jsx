import React, { useEffect, useMemo, useState } from "react";
import { gameApi } from "../api/game";
import Header from "../components/Header";
import GameGrid from "../components/GameGrid";
import GameModal from "../components/GameModal";
import useDebounce from "../hooks/useDebounce";
import { userApi } from "../api/users";
import useAuth from "../hooks/useAuth";
import "../css/MainPage.css";

export default function MainPage() {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 280);

  const [visibleCount, setVisibleCount] = useState(12); // загружаем пачками по 12

  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await gameApi.getAll();
        if (isAuthenticated) {
          const authUser = await userApi.getAuthenticated();
          setUserInfo(authUser);
        }
        if (!mounted) return;
        setGames(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || err?.message || "Ошибка при загрузке игр");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [isAuthenticated]);

  const filtered = useMemo(() => {
    const q = (debouncedSearch || "").trim();
    if (q.length < 3) return games;
    const qq = q.toLowerCase();
    return games.filter(g => (g.title || "").toLowerCase().includes(qq) || (g.description || "").toLowerCase().includes(qq));
  }, [games, debouncedSearch]);

  useEffect(() => {
    setVisibleCount(12);
  }, [debouncedSearch]);

  const visibleGames = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(filtered.length, prev + 12));
  };

  return (
    <div className="main-root">
      <Header
        search={search}
        onSearchChange={setSearch}
        currentUser={userInfo}
      />

      <main className="main-content">
        {loading && <div className="main-info">Загрузка игр...</div>}
        {error && <div className="main-error">{error}</div>}

        {!loading && !error && (
          <>
            <GameGrid
              games={visibleGames}
              onOpenGame={(g) => setSelectedGame(g)}
            />

            {canLoadMore && (
              <div className="load-more-wrap">
                <button className="btn btn-primary load-more" onClick={handleLoadMore}>Загрузить ещё</button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} onDownloadRules={() => { }} />
      )}
    </div>
  );
}