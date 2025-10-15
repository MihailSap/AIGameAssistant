// src/pages/CatalogPage.jsx  (или где у вас этот файл лежит)
import React, { useEffect, useMemo, useState } from "react";
import { gameApi } from "../api/game";
import { favouriteApi } from "../api/favourite";
import Header from "../components/Header";
import GameGrid from "../components/GameGrid";
import GameModal from "../components/GameModal";
import useDebounce from "../hooks/useDebounce";
import { userApi } from "../api/users";
import useAuth from "../hooks/useAuth";
import "../css/MainPage.css";
import "../css/CatalogPage.css";

export default function CatalogPage() {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 280);

  const [visibleCount, setVisibleCount] = useState(10);

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

  useEffect(() => {
    let cancelled = false;
    const loadFavs = async () => {
      if (!isAuthenticated) {
        setFavourites([]);
        return;
      }
      setLoadingFavs(true);
      try {
        const favs = await favouriteApi.getAll();
        if (cancelled) return;
        setFavourites(Array.isArray(favs) ? favs : []);
      } catch (err) {
        console.error("Не удалось загрузить избранные:", err);
        setFavourites([]);
      } finally {
        if (!cancelled) setLoadingFavs(false);
      }
    };
    loadFavs();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const handleFavouriteChange = (gameObj, isNowFavourite) => {
    if (!gameObj || !gameObj.id) return;
    setFavourites(prev => {
      const exists = prev.some(f => String(f.id) === String(gameObj.id));
      if (isNowFavourite && !exists) {
        return [gameObj, ...prev];
      }
      if (!isNowFavourite && exists) {
        return prev.filter(f => String(f.id) !== String(gameObj.id));
      }
      return prev;
    });
  };

  const filterGames = (games) => {
    const q = (debouncedSearch || "").trim();
    if (q.length < 3) return games;
    const qq = q.toLowerCase();
    return games.filter(g => (g.title || "").toLowerCase().includes(qq) || (g.description || "").toLowerCase().includes(qq));
  };

  const filtered = useMemo(() => {
    return filterGames(games);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games, debouncedSearch]);

  const filteredFavourites = useMemo(() => {
    return filterGames(favourites);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favourites, debouncedSearch]);

  useEffect(() => {
    setVisibleCount(10);
  }, [debouncedSearch]);

  const visibleGames = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(filtered.length, prev + 10));
  };

  return (
    <div className="catalog-root">
      <Header
        search={search}
        onSearchChange={setSearch}
        currentUser={userInfo}
      />

      <main className="catalog-content">
        {loading && <div className="catalog-info">Загрузка игр...</div>}
        {error && <div className="catalog-error">{error}</div>}

        {!loading && !error && (
          <>
            <h1 className="page-title">Каталог игр</h1>

            {isAuthenticated && (
              <section className="favourite-games-section">
                <h2>Избранные игры</h2>
                {loadingFavs ? (
                  <div className="catalog-info">Загрузка избранных...</div>
                ) : filteredFavourites && filteredFavourites.length ? (
                  <GameGrid
                    games={filteredFavourites}
                    onOpenGame={(g) => setSelectedGame(g)}
                  />
                ) : (
                  <div className="catalog-info">{favourites.length === 0 ? "У вас пока нет избранных игр" : "Ничего не найдено"}</div>
                )}
              </section>
            )}

            {filtered && filtered.length ? (
            <GameGrid
              games={visibleGames}
              onOpenGame={(g) => setSelectedGame(g)}
            />
            ) : (
              <div className="catalog-info">{games.length === 0 ? "Игр пока нет" : "Ничего не найдено"}</div>
            )}
            {canLoadMore && (
              <div className="load-more-wrap">
                <button className="btn load-more" onClick={handleLoadMore}>Загрузить ещё</button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedGame && (
        <GameModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onFavouriteChange={handleFavouriteChange}
        />
      )}
    </div>
  );
}
