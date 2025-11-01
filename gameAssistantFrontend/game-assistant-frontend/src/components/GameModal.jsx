import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { fileApi } from "../api/file";
import { gameApi } from "../api/game";
import { favouriteApi } from "../api/favourite";
import useAuth from "../hooks/useAuth";
import "../css/MainPage.css";
import "../css/GameModal.css";
import useBlobUrl from "../hooks/useBlobUrl";
import { downloadBlob } from "../utils/blobUtils";

export default function GameModal({ game, onClose, onFavouriteChange }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [gameData, setGameData] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);
    const [loadingGame, setLoadingGame] = useState(true);

    const [isFavourite, setIsFavourite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const attemptedRef = useRef(false);
    const mountedRef = useRef(true);

    const { url: imageUrl, loading: blobLoading } = useBlobUrl(fileApi.getImageBlob, gameData?.imageFileTitle, [gameData?.imageFileTitle]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setGameData(null);

        (async () => {
            setLoadingGame(true);
            try {
                const data = await gameApi.read(game.id);
                if (cancelled) return;
                if (mountedRef.current) setGameData(data);
            } catch (err) {
                if (!cancelled && mountedRef.current) setGameData(null);
            } finally {
                if (!cancelled && mountedRef.current) setLoadingGame(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [game]);

    useEffect(() => {
        let cancelled = false;
        if (!isAuthenticated) {
            setIsFavourite(false);
            return;
        }
        if (!gameData?.id) return;

        (async () => {
            try {
                const favs = await favouriteApi.getAll();
                if (cancelled) return;
                const exists = Array.isArray(favs) && favs.some(f => String(f.id) === String(gameData.id));
                if (mountedRef.current) setIsFavourite(Boolean(exists));
            } catch (err) { }
        })();

        return () => {
            cancelled = true;
        };
    }, [gameData, isAuthenticated]);

    useEffect(() => {
        attemptedRef.current = false;
        setLoadingImage(!!gameData?.imageFileTitle);
        if (!gameData?.imageFileTitle) {
            setLoadingImage(false);
            return;
        }
    }, [gameData?.imageFileTitle]);

    useEffect(() => {
        setLoadingImage(Boolean(blobLoading));
    }, [blobLoading]);

    const handleImgLoad = () => {
        if (mountedRef.current) setLoadingImage(false);
    };

    const handleDownloadRules = async () => {
        const rulesFileTitle = gameData?.rulesFileTitle;
        if (!rulesFileTitle) return alert("Правила отсутствуют");
        try {
            const blob = await fileApi.getRulesBlob(rulesFileTitle);
            await downloadBlob(blob, rulesFileTitle);
        } catch (err) {
            alert("Не удалось скачать правила");
        }
    };

    const toggleFavourite = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (!gameData?.id) return;

        setFavLoading(true);
        const prev = isFavourite;
        setIsFavourite(!prev);
        try {
            if (!prev) {
                await favouriteApi.add(gameData.id);
            } else {
                await favouriteApi.remove(gameData.id);
            }
            if (typeof onFavouriteChange === "function") onFavouriteChange(gameData, !prev);
        } catch (err) {
            if (mountedRef.current) setIsFavourite(prev);
            alert("Не удалось обновить избранное. Попробуйте ещё раз.");
        } finally {
            if (mountedRef.current) setFavLoading(false);
        }
    };

    const titleText = loadingGame ? "Загрузка..." : gameData?.title || "Название отсутствует";
    const descriptionText = loadingGame ? "" : gameData?.description || "Описание отсутствует";

    return (
        <Modal onClose={onClose}>
            <div className="game-modal-window" role="dialog" aria-modal="true">
                <h2 className="gm-title">{titleText}</h2>
                <div className="gm-body">
                    <div className="gm-left">
                        <div className="gm-image-wrap">
                            {imageUrl ? (
                                <>
                                    <img
                                        src={imageUrl}
                                        alt={gameData?.title || "game image"}
                                        className="modal-image"
                                        onLoad={handleImgLoad}
                                    />
                                </>
                            ) : loadingImage ? (
                                <div className="modal-image placeholder">
                                    <div className="loading-text">Загрузка...</div>
                                </div>
                            ) : (
                                <div className="modal-image placeholder">
                                    <div className="gm-error">Не удалось загрузить</div>
                                </div>
                            )}
                        </div>

                        <div className="gm-btn-row">
                            <button
                                className="btn gm-circle-btn"
                                onClick={handleDownloadRules}
                                disabled={loadingGame || !gameData}
                                title="Смотреть правила игры"
                                aria-label="Смотреть правила игры"
                            >
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="
                      M12 6.90909C10.8999 5.50893 9.20406 4.10877 5.00119 4.00602C4.72513 3.99928 4.5 4.22351 4.5 4.49965C4.5 6.54813 4.5 14.3034 
                      4.5 16.597C4.5 16.8731 4.72515 17.09 5.00114 17.099C9.20405 17.2364 10.8999 19.0998 12 20.5M12 6.90909C13.1001 5.50893 14.7959 4.10877 
                      18.9988 4.00602C19.2749 3.99928 19.5 4.21847 19.5 4.49461C19.5 6.78447 19.5 14.3064 19.5 16.5963C19.5 16.8724 19.2749 17.09 18.9989 
                      17.099C14.796 17.2364 13.1001 19.0998 12 20.5M12 6.90909L12 20.5
                  "
                                        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="
                      M19.2353 6H21.5C21.7761 6 22 6.22386 22 6.5V19.539C22 19.9436 21.5233 20.2124 21.1535 20.0481C20.3584 19.6948 19.0315 19.2632 17.2941 
                      19.2632C14.3529 19.2632 12 21 12 21C12 21 9.64706 19.2632 6.70588 19.2632C4.96845 19.2632 3.64156 19.6948 2.84647 20.0481C2.47668 20.2124 2 
                      19.9436 2 19.539V6.5C2 6.22386 2.22386 6 2.5 6H4.76471
                  " stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="gm-tooltip">Смотреть правила</span>
                            </button>

                            <button
                                className="btn gm-circle-btn"
                                onClick={toggleFavourite}
                                disabled={favLoading || loadingGame}
                                aria-pressed={isFavourite}
                                title={isFavourite ? "Удалить из избранного" : "Добавить в избранное"}
                            >
                                <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="
                      M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 
                      18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 
                      12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 
                      3.2753 13.7994 3.90317 12 6.00019Z
                  " fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="gm-tooltip">{isFavourite ? "Удалить из избранного" : "Добавить в избранное"}</span>
                            </button>

                            <button
                                className="btn gm-circle-btn"
                                onClick={() => navigate(`/games/ai/${gameData?.id}`)}
                                disabled={loadingGame || !gameData}
                                title="Задать вопрос"
                                aria-label="Задать вопрос"
                            >
                                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M21 15a2 2 0 0 1-2 2H8l-5 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M7.5 9.5h9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M7.5 12.5h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span className="gm-tooltip">Задать вопрос</span>
                            </button>
                        </div>
                    </div>

                    <div className="gm-right">
                        <div className="gm-description" tabIndex="0">{descriptionText}</div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
