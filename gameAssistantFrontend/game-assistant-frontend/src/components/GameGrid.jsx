import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameCard from "./GameCard";
import "../css/GameGrid.css";

export default function GameGrid({ games = [], onOpenGame }) {
    return (
        <div className="grid-wrap">
            <div className="grid-surface">
                <div className="games-grid">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {games.map((g) => (
                            <motion.div
                                key={g.id}
                                layout
                                layoutId={`game-${g.id}`}
                                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                                transition={{
                                    opacity: { duration: 0.22 },
                                    y: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] },
                                    scale: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] },
                                    layout: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }
                                }}
                                className="game-item"
                            >
                                <GameCard game={g} onOpen={() => onOpenGame(g)} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
