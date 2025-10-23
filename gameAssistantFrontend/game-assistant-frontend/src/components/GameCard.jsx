import React, { useEffect, useRef, useState } from "react";
import { fileApi } from "../api/file";
import "../css/GameCard.css";

export default function GameCard({ game, onOpen = () => { }, imageBlobUrl = null }) {
  const [imageUrl, setImageUrl] = useState(imageBlobUrl || null);
  const [loading, setLoading] = useState(Boolean(game.imageFileTitle && !imageBlobUrl));
  const mountedRef = useRef(true);
  const blobRef = useRef(null);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (blobRef.current && typeof blobRef.current === "string" && blobRef.current.startsWith && blobRef.current.startsWith("blob:")) {
        try { URL.revokeObjectURL(blobRef.current); } catch (e) { }
        blobRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (imageBlobUrl) {
      setImageUrl(imageBlobUrl);
      setLoading(false);
      return;
    }
    if (!game.imageFileTitle) {
      setImageUrl(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    (async () => {
      try {
        const blob = await fileApi.getImageBlob(game.imageFileTitle);
        if (cancelled || !mountedRef.current) {
          try { URL.createObjectURL(blob); } catch (e) { }
          return;
        }
        const url = URL.createObjectURL(blob);
        blobRef.current = url;
        setImageUrl(url);
        setLoading(false);
      } catch (err) {
        setImageUrl(null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [game.imageFileTitle, imageBlobUrl]);

  return (
    <div className={'tile-card'} role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="tile-media">
        {loading && <div className="tile-empty">Загрузка...</div>}
        {imageUrl ? <img src={imageUrl} alt={game.title} className="tile-img" /> : <div className="tile-empty">Нет изображения</div>}
        <div className="tile-overlay">
          <div className="tile-desc">{game.description}</div>
        </div>
        <div className="tile-title-strip">
          <div className="tile-title">{game.title}</div>
        </div>
      </div>
    </div>
  );
}
