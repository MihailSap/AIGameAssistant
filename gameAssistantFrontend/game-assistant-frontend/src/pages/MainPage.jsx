import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameApi } from "../api/game";
import Header from "../components/Header";
import GameGrid from "../components/GameGrid";
import GameModal from "../components/GameModal";
import { userApi } from "../api/users";
import useAuth from "../hooks/useAuth";
import "../css/MainPage.css";

export default function MainPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const visibleCount = 5;

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

  const visibleGames = games.slice(0, visibleCount);

  return (
    <div className="main-root">
      <Header currentUser={userInfo} main={true} admin={true} />

      <main className="main-content">
        {loading && <div className="main-info">Загрузка...</div>}
        {error && <div className="main-error">{error}</div>}

        {!loading && !error && (
          <>
            <h1 className="page-title">Каталог игр</h1>

            <GameGrid
              games={visibleGames}
              onOpenGame={(g) => setSelectedGame(g)}
            />

            <div className="load-more-wrap">
              <button className="btn catalog-btn" onClick={() => navigate('/games')}>Смотреть всё</button>
            </div>
          </>
        )}
      </main>

      {selectedGame && (
        <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} onDownloadRules={() => { }} />
      )}
    </div>
  );
}