import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { fileApi } from "../api/file";

import "../css/MainPage.css";
import "../css/GameModal.css";

export default function GameModal({ game, onClose }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(!!game.imageFileTitle);
    const attemptedRef = useRef(false);
    const blobRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (blobRef.current && blobRef.current.startsWith("blob:")) {
                URL.revokeObjectURL(blobRef.current);
                blobRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        attemptedRef.current = false;
        if (blobRef.current && blobRef.current.startsWith("blob:")) {
            URL.revokeObjectURL(blobRef.current);
            blobRef.current = null;
        }

        setImageUrl(null);
        setLoading(!!game.imageFileTitle);

        if (!game.imageFileTitle) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            if (attemptedRef.current) return;
            attemptedRef.current = true;
            setLoading(true);
            try {
                const blob = await fileApi.getImageBlob(game.imageFileTitle);
                if (cancelled) return;
                const url = URL.createObjectURL(blob);
                blobRef.current = url;
                if (mountedRef.current) setImageUrl(url);
            } catch (err) {
                console.warn("Не удалось загрузить изображение для модалки", err);
                if (mountedRef.current) {
                    setImageUrl(null);
                    setLoading(false);
                }
            } finally {
                attemptedRef.current = false;
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [game.imageFileTitle]);

    const fetchBlobAndSet = async () => {
        if (attemptedRef.current || !game.imageFileTitle) {
            setLoading(false);
            return;
        }
        attemptedRef.current = true;
        setLoading(true);
        try {
            const blob = await fileApi.getImageBlob(game.imageFileTitle);
            const url = URL.createObjectURL(blob);
            blobRef.current = url;
            if (mountedRef.current) setImageUrl(url);
        } catch (err) {
            console.warn("Не удалось загрузить изображение для модалки (fallback)", err);
            if (mountedRef.current) {
                setImageUrl(null);
                setLoading(false);
            }
        } finally {
            attemptedRef.current = false;
        }
    };

    const handleImgError = () => {
        fetchBlobAndSet();
    };

    const handleImgLoad = () => {
        if (mountedRef.current) setLoading(false);
    };

    const handleDownloadRules = async () => {
        if (!game.rulesFileTitle) return alert("Правила отсутствуют");
        try {
            const blob = await fileApi.getRulesBlob(game.rulesFileTitle);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = game.rulesFileTitle;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error(err);
            alert("Не удалось скачать правила");
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="game-modal-content">
                <div className="game-modal-left">
                    <div className="modal-image-wrap">
                        {imageUrl ? (
                            <>
                                <img
                                    src={imageUrl}
                                    alt={game.title}
                                    className="modal-image"
                                    onError={handleImgError}
                                    onLoad={handleImgLoad}
                                />
                                {loading && (
                                    <div className="loading-overlay" aria-hidden="true">
                                        <div className="loading-text">Загрузка...</div>
                                    </div>
                                )}
                            </>
                        ) : loading ? (
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
                    <div>
                        <h3 className="modal-title">{game.title}</h3>
                        <p className="modal-description">{game.description || "Описание отсутствует"}</p>
                    </div>
                    <div className="game-modal-actions">
                        {game.rulesFileTitle && (
                            <button className="btn btn-ghost" onClick={handleDownloadRules}>Скачать правила</button>
                        )}
                        <button className="btn btn-primary">Задать вопрос ИИ</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
