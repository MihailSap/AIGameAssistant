import React, { useLayoutEffect, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game";
import { categoryApi } from "../api/category";
import { favouriteApi } from "../api/favourite";
import Header from "../components/Header";
import Hero from "../components/Hero";
import GameGrid from "../components/GameGrid";
import GameModal from "../components/GameModal";
import ToggleSlider from "../components/ToggleSlider";
import SelectDropdown from "../components/SelectDropdown";
import useDebounce from "../hooks/useDebounce";
import { userApi } from "../api/users";
import useAuth from "../hooks/useAuth";
import "../css/MainPage.css";

export default function MainPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const computeIncrement = () => {
    if (typeof window === "undefined") return 10;
    const w = window.innerWidth;
    if (w < 549) return 3;
    if (w < 799) return 4;
    if (w < 1099) return 6;
    if (w < 1399) return 8;
    return 10;
  };

  const initialIncrement = computeIncrement();

  const [games, setGames] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [gameError, setGameError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 280);

  const [incrementCount, setIncrementCount] = useState(() => initialIncrement);
  const [pagesLoaded, setPagesLoaded] = useState(1);
  const [visibleCount, setVisibleCount] = useState(() => initialIncrement);
  const [absoluteCount, setAbsoluteCount] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null);

  const [showFavourites, setShowFavourites] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const visibleCountRef = useRef(visibleCount);
  const incrementCountRef = useRef(incrementCount);

  const refreshAllGames = async (isLoadMore = false) => {
    isLoadMore ? setLoadingMore(true) : setGameLoading(true);
    try {
      let data = null;
      if (showFavourites) {
        if (!isAuthenticated) {
          setGames([]);
          setAbsoluteCount(0);
          return;
        }
        data = await favouriteApi.getAllPaged(0, visibleCount, (debouncedSearch || "").trim() || null, selectedCategory || null);
      } else {
        data = await gameApi.getAllPaged(0, visibleCount, (debouncedSearch || "").trim() || null, selectedCategory || null);
      }
      setGames(Array.isArray(data?.content) ? data.content : []);
      setAbsoluteCount(data?.totalElements || 0);
      setError(null);
    } catch (err) {
      setGameError(err?.response?.data?.message || err?.message || "Ошибка при загрузке игр");
    } finally {
      isLoadMore ? setLoadingMore(false) : setGameLoading(false);
    }
  };

  useEffect(() => { incrementCountRef.current = incrementCount; }, [incrementCount]);
  useEffect(() => { visibleCountRef.current = visibleCount; }, [visibleCount]);

  useLayoutEffect(() => {
    let raf = 0;

    const calc = () => {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      let newInc = 10;
      if (w < 549) newInc = 3;
      else if (w < 799) newInc = 4;
      else if (w < 1099) newInc = 6;
      else if (w < 1399) newInc = 8;
      else newInc = 10;

      const prevInc = incrementCountRef.current || initialIncrement;
      if (prevInc === newInc) return;

      const currentVisible = visibleCountRef.current || prevInc;
      const pages = Math.max(1, Math.ceil(currentVisible / prevInc));
      setPagesLoaded(pages);
      setIncrementCount(newInc);
    };

    calc();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await gameApi.getAllPaged(0, 10);
        if (!mounted) return;
        setTopGames(Array.isArray(data?.content) ? data.content : []);
        setError(null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Ошибка при загрузке топ-10 игр");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    setVisibleCount(Math.max(1, pagesLoaded) * incrementCount);
  }, [pagesLoaded, incrementCount]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshAllGames();
      if (!mounted) return;
    })();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCategory, showFavourites]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshAllGames(true);
      if (!mounted) return;
    })();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated) {
        return;
      }
      setLoading(true);
      try {
        const authUser = await userApi.getAuthenticated();
        if (!mounted) return;
        setUserInfo(authUser);
        setError(null);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Ошибка при загрузке данных пользователя");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [isAuthenticated]);

  const handleSelectFavourites = (isShowFavourites) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowFavourites(isShowFavourites);
    setPagesLoaded(1);
  };

  const handleFavouriteChange = (gameObj, isNowFavourite) => {
    if (!gameObj || !gameObj.id || !showFavourites) return;
    setGames(prev => {
      const exists = prev.some(f => String(f.id) === String(gameObj.id));
      if (isNowFavourite && !exists) return [gameObj, ...prev].sort((a, b) => {
        const ta = (a?.title ?? '').trim();
        const tb = (b?.title ?? '').trim();
        return ta.localeCompare(tb, 'ru', { sensitivity: 'base', numeric: true });
      });
      if (!isNowFavourite && exists) return prev.filter(f => String(f.id) !== String(gameObj.id));
      return prev;
    });
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

        {!loading && error && <div className="loading-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="hero-anchor">
              <Hero
                topGames={topGames}
                onOpenGame={(g) => setSelectedGame(g)}
              />
            </div>

            <div className="grid-container">
              <div className="grid-top-controls">
                <SelectDropdown
                  fetchItems={() => categoryApi.getAll().then(list => Array.isArray(list) ? list.map(c => c.name) : [])}
                  cacheKey="categories"
                  value={selectedCategory}
                  onChange={(v) => { setSelectedCategory(v); setPagesLoaded(1); }}
                  allowNull={true}
                  placeholder="Категория игр"
                />
                <div className="slider-container">
                  <ToggleSlider
                    leftLabel="Избранное"
                    rightLabel="Все игры"
                    value={showFavourites}
                    onChange={handleSelectFavourites}
                  />
                </div>
              </div>

              <div className="games-area">
                {games && games.length ? (
                  <GameGrid games={games} onOpenGame={(g) => setSelectedGame(g)} loading={gameLoading} error={gameError} />
                ) : (
                  <div className="catalog-info">{games.length === 0 ? "Игр пока нет" : "Ничего не найдено"}</div>
                )}

                {(visibleCount < absoluteCount || loadingMore) && (
                  <div className="load-more-wrap">
                    <button
                      className="btn load-more"
                      disabled={loadingMore}
                      onClick={() => setPagesLoaded(p => p + 1)}
                    >
                      {loadingMore ? "Загрузка..." : "Загрузить ещё"}
                    </button>
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
          visibleCount={visibleCount}
        />
      )}
    </div>
  );
}
