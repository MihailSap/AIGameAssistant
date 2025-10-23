import React from "react";
import GameCard from "./GameCard";
import "../css/GameGrid.css";

export default function GameGrid({ games = [], onOpenGame }) {
    return (
        <div className="grid-wrap">
            <div className="grid-surface">
                <div className="games-grid">
                    {games.map(g => (
                        <GameCard key={g.id} game={g} onOpen={() => onOpenGame(g)} />
                    ))}
                </div>
            </div>
        </div>
    );
}