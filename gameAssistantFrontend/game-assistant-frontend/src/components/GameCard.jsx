import React, { useEffect, useState } from "react";
import { fileApi } from "../api/file";
import useBlobUrl from "../hooks/useBlobUrl";
import "../css/GameCard.css";

export default function GameCard({ game, onOpen = () => { }, imageBlobUrl = null }) {
  const [imageUrl, setImageUrl] = useState(imageBlobUrl || null);
  const [loading, setLoading] = useState(Boolean(game.imageFileTitle && !imageBlobUrl));

  const { url, loading: blobLoading } = useBlobUrl(fileApi.getImageBlob, game.imageFileTitle, [game.imageFileTitle]);

  useEffect(() => {
    if (imageBlobUrl) {
      setImageUrl(imageBlobUrl);
      setLoading(false);
      return;
    }
    setImageUrl(url);
    setLoading(Boolean(blobLoading));
  }, [url, blobLoading, imageBlobUrl]);

  return (
    <div className="tile-card" role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="tile-media">
        {loading && <div className="tile-empty">Загрузка...</div>}
        {imageUrl ? <img src={imageUrl} alt={game.title} className="tile-img" /> : <div className="tile-empty">Не удалось загрузить</div>}
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
