import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { fileApi } from "../api/file";
import { gameApi } from "../api/game";
import { favouriteApi } from "../api/favourite";
import useAuth from "../hooks/useAuth";

import "../css/CatalogPage.css";
import "../css/GameModal.css";

export default function GameModal({ game, onClose, onFavouriteChange }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [gameData, setGameData] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);
    const [loadingGame, setLoadingGame] = useState(true);

    const [isFavourite, setIsFavourite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    const attemptedRef = useRef(false);
    const blobRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (blobRef.current && blobRef.current.startsWith && blobRef.current.startsWith("blob:")) {
                URL.revokeObjectURL(blobRef.current);
                blobRef.current = null;
            }
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
                if (mountedRef.current) {
                    setGameData(data);
                }
            } catch (err) {
                console.error("Не удалось загрузить данные игры", err);
                if (!cancelled && mountedRef.current) {
                    setGameData(null);
                }
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
            } catch (err) {
                console.warn("Не удалось загрузить избранные для проверки статуса", err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [gameData, isAuthenticated]);

    useEffect(() => {
        attemptedRef.current = false;
        if (blobRef.current && blobRef.current.startsWith && blobRef.current.startsWith("blob:")) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = null;
        }

        setImageUrl(null);
        const imageFileTitle = gameData?.imageFileTitle;
        setLoadingImage(!!imageFileTitle);

        if (!imageFileTitle) {
            setLoadingImage(false);
            return;
        }

        let cancelled = false;

        (async () => {
            if (attemptedRef.current) return;
            attemptedRef.current = true;
            setLoadingImage(true);
            try {
                const blob = await fileApi.getImageBlob(imageFileTitle);
                if (cancelled) return;
                const url = URL.createObjectURL(blob);
                blobRef.current = url;
                if (mountedRef.current) setImageUrl(url);
            } catch (err) {
                console.warn("Не удалось загрузить изображение для модалки", err);
                if (mountedRef.current) {
                    setImageUrl(null);
                    setLoadingImage(false);
                }
            } finally {
                attemptedRef.current = false;
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [gameData?.imageFileTitle]);

    const fetchBlobAndSet = async () => {
        const imageFileTitle = gameData?.imageFileTitle;
        if (attemptedRef.current || !imageFileTitle) {
            setLoadingImage(false);
            return;
        }
        attemptedRef.current = true;
        setLoadingImage(true);
        try {
            const blob = await fileApi.getImageBlob(imageFileTitle);
            const url = URL.createObjectURL(blob);
            blobRef.current = url;
            if (mountedRef.current) setImageUrl(url);
        } catch (err) {
            console.warn("Не удалось загрузить изображение для модалки (fallback)", err);
            if (mountedRef.current) {
                setImageUrl(null);
                setLoadingImage(false);
            }
        } finally {
            attemptedRef.current = false;
        }
    };

    const handleImgError = () => {
        fetchBlobAndSet();
    };

    const handleImgLoad = () => {
        if (mountedRef.current) setLoadingImage(false);
    };

    const handleDownloadRules = async () => {
        const rulesFileTitle = gameData?.rulesFileTitle;
        if (!rulesFileTitle) return alert("Правила отсутствуют");
        try {
            const blob = await fileApi.getRulesBlob(rulesFileTitle);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = rulesFileTitle;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error(err);
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
            if (typeof onFavouriteChange === "function") {
                onFavouriteChange(gameData, !prev);
            }
        } catch (err) {
            console.error("Ошибка при переключении избранного:", err);
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
            <div className="game-modal-content">
                <div className="game-modal-left">
                    <div className="modal-image-wrap">
                        {imageUrl ? (
                            <>
                                <img
                                    src={imageUrl}
                                    alt={gameData?.title || "game image"}
                                    className="modal-image"
                                    onError={handleImgError}
                                    onLoad={handleImgLoad}
                                />
                                {loadingImage && (
                                    <div className="loading-overlay" aria-hidden="true">
                                        <div className="loading-text">Загрузка...</div>
                                    </div>
                                )}
                            </>
                        ) : loadingImage ? (
                            <div className="modal-image placeholder">
                                <div className="loading-text">Загрузка...</div>
                            </div>
                        ) : (
                            <div className="modal-image placeholder">
                                <div className="loading-text">Нет изображения</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="game-modal-right">
                    <div className="game-modal-header">
                        <div className="game-modal-header-left">
                            <h3 className="modal-title">{titleText}</h3>
                            <p className="modal-description">{descriptionText}</p>
                        </div>

                        <div className="game-modal-header-right">
                            <button
                                className={`fav-btn ${isFavourite ? "fav" : ""}`}
                                onClick={toggleFavourite}
                                disabled={favLoading || loadingGame}
                                aria-pressed={isFavourite}
                                title={isFavourite ? "Удалить из избранного" : "Добавить в избранное"}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M20.8 7.6c0 5.6-8.8 12-8.8 12S3.2 13.2 3.2 7.6A4.4 4.4 0 0 1 7.6 3.2c1.6 0 3 .8 3.8 2.1A4.64 4.64 0 0 1 14.9 3.2c2.4 0 4.4 2 4.4 4.4z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="game-modal-actions">
                        {gameData?.rulesFileTitle && (
                            <button className="btn btn-ghost" onClick={handleDownloadRules}>Скачать правила</button>
                        )}
                        <button
                            className="btn"
                            onClick={() => navigate(`/games/ai`, { state: { game: gameData } })}
                            disabled={loadingGame || !gameData}
                        >
                            Задать вопрос ИИ
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
