import React, { useState, useRef, useEffect } from "react";
import { fileApi } from "../api/file";
import "../css/MainPage.css";
import "../css/GameCard.css";

export default function GameCard({ game, onOpen }) {
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
      try {
        const blob = await fileApi.getImageBlob(game.imageFileTitle);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        if (mountedRef.current) setImageUrl(url);
      } catch (err) {
        console.warn("Не удалось загрузить изображение через blob:", game.imageFileTitle, err);
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
      console.warn("Не удалось загрузить изображение через blob (fallback):", game.imageFileTitle, err);
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

  return (
    <div
      className="game-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="game-image-wrap">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={game.title}
              className="game-image"
              onError={handleImgError}
              onLoad={handleImgLoad}
            />
            {loading && (
              <div className="game-image placeholder" aria-hidden="true">
                <div className="loading-text">Загрузка...</div>
              </div>
            )}
          </>
        ) : (
          <div className="game-image placeholder">
            <div className="loading-text">{loading ? "Загрузка..." : "Нет изображения"}</div>
          </div>
        )}

        <div className="game-overlay">
          <div className="game-title">{game.title}</div>
        </div>

        <div className="game-hover">
          <div className="game-desc">
            {game.description ? (game.description.length > 50 ? game.description.slice(0, 50) + "..." : game.description) : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
