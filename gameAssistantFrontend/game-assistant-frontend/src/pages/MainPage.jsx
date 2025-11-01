import React, { useEffect, useMemo, useState, /*useRef*/ } from "react";
import { gameApi } from "../api/game";
import { favouriteApi } from "../api/favourite";
import Header from "../components/Header";
import Hero from "../components/Hero";
import GameGrid from "../components/GameGrid";
import GameModal from "../components/GameModal";
import ToggleSlider from "../components/ToggleSlider";
import useDebounce from "../hooks/useDebounce";
import { userApi } from "../api/users";
import useAuth from "../hooks/useAuth";
import "../css/MainPage.css";

export default function MainPage() {
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

  const [showFavourites, setShowFavourites] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await gameApi.getAll();
        if (isAuthenticated) {
          const authUser = await userApi.getAuthenticated();
          if (mounted) setUserInfo(authUser);
        }
        if (!mounted) return;
        setGames(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
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
        setFavourites([]);
      } finally {
        if (!cancelled) setLoadingFavs(false);
      }
    };
    loadFavs();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      let increment = 10;
      if (w < 549) increment = 3;
      else if (w < 799) increment = 4;
      else if (w < 1099) increment = 6;
      else if (w < 1399) increment = 8;
      else increment = 10;
      setVisibleCount(increment);
    };

    calc();

    let raf = 0;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calc);
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [debouncedSearch, showFavourites]);

  const handleFavouriteChange = (gameObj, isNowFavourite) => {
    if (!gameObj || !gameObj.id) return;
    setFavourites(prev => {
      const exists = prev.some(f => String(f.id) === String(gameObj.id));
      if (isNowFavourite && !exists) return [gameObj, ...prev];
      if (!isNowFavourite && exists) return prev.filter(f => String(f.id) !== String(gameObj.id));
      return prev;
    });
  };

  const filterGames = (list) => {
    const q = (debouncedSearch || "").trim();
    if (q.length < 2) return list;
    const qq = q.toLowerCase();
    return list.filter(g => (g.title || "").toLowerCase().includes(qq) || (g.description || "").toLowerCase().includes(qq));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filtered = useMemo(() => filterGames(games), [games, debouncedSearch]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredFavourites = useMemo(() => filterGames(favourites), [favourites, debouncedSearch]);

  const sourceList = showFavourites ? filteredFavourites : filtered;
  const visibleGames = sourceList.slice(0, visibleCount);
  const canLoadMore = visibleCount < sourceList.length;

  const handleLoadMore = () => {
    const w = window.innerWidth;
    let increment = 10;
    if (w < 549) increment = 3;
    else if (w < 799) increment = 4;
    else if (w < 1099) increment = 6;
    else if (w < 1399) increment = 8;
    else increment = 10;
    setVisibleCount(prev => Math.min(sourceList.length, prev + increment));
  };

  return (
    <div className="catalog-root">
      <Header
        search={search}
        onSearchChange={setSearch}
        currentUser={userInfo}
      />

      <main className="catalog-content">
        {loading && (
          <div className="full-loader">
            <div className="spinner" />
          </div>
        )}

        {!loading && error && <div className="catalog-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="hero-anchor">
              <Hero
                topIds={["7", "8", "9", "11", "12", "13", "14", "15", "16", "17"]}
                gamesMap={games.reduce((acc, g) => { acc[g.id] = g; return acc }, {})}
                onOpenGame={(g) => setSelectedGame(g)}
              />
            </div>

            <div className="grid-container">
              <div className="grid-top-controls">
                <ToggleSlider
                  leftLabel="Избранное"
                  rightLabel="Все игры"
                  value={showFavourites}
                  onChange={(v) => setShowFavourites(v)}
                />
              </div>

              <div className="games-area">
                {isAuthenticated && showFavourites && (
                  loadingFavs ? <div className="catalog-info">Загрузка избранных...</div> : null
                )}

                {sourceList && sourceList.length ? (
                  <GameGrid games={visibleGames} onOpenGame={(g) => setSelectedGame(g)} />
                ) : (
                  <div className="catalog-info">{games.length === 0 ? "Игр пока нет" : "Ничего не найдено"}</div>
                )}

                {canLoadMore && (
                  <div className="load-more-wrap">
                    <button className="btn load-more yellow" onClick={handleLoadMore}>Загрузить ещё</button>
                  </div>
                )}
              </div>
            </div>
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
