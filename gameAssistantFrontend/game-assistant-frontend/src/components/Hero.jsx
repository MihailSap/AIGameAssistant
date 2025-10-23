import React from "react";
import TopCarousel from "./TopCarousel";
import "../css/Hero.css";

export default function Hero({ topIds = [], gamesMap = {}, onOpenGame }) {
    const topGames = topIds.map(id => gamesMap[id]).filter(Boolean);
    return (
        <section className="hero-root">
            <div className="hero-bg" />
            <div className="hero-inner">
                <div className="hero-left">
                    <h2 className="hero-title">ПРОВЕДИТЕ ВЕЧЕР С КОМФОРТОМ</h2>
                </div>
                <div className="hero-right">
                    <div className="top-label">ТОП-10</div>
                    <TopCarousel items={topGames} onOpenGame={onOpenGame} />
                </div>
            </div>
        </section>
    );
}