import React, { useEffect, useMemo, useRef, useState } from "react";
import GameCard from "./GameCard";
import "../css/TopCarousel.css";
import leftArrow from "../img/left-arrow.svg";
import rightArrow from "../img/right-arrow.svg";
import { fileApi } from "../api/file";

function useBlobCache(items, concurrency = 6) {
    const cacheRef = useRef(new Map());
    const createdRef = useRef(new Set());

    useEffect(() => {
        const titles = Array.from(new Set((items || []).map(i => i && i.imageFileTitle).filter(Boolean)));
        const toLoad = titles.filter(t => !cacheRef.current.has(t));
        if (!toLoad.length) return;

        let cancelled = false;

        const queue = toLoad.slice();
        const workers = new Array(Math.min(concurrency, queue.length)).fill(0).map(async () => {
            while (queue.length && !cancelled) {
                const k = queue.shift();
                try {
                    const blob = await fileApi.getImageBlob(k);
                    if (cancelled) break;
                    const url = URL.createObjectURL(blob);
                    cacheRef.current.set(k, url);
                    createdRef.current.add(k);
                } catch (e) {
                    if (!cancelled) {
                        cacheRef.current.set(k, null);
                    }
                }
            }
        });

        Promise.all(workers).catch(() => { });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.map ? items.map(i => i && i.imageFileTitle).join("|") : items.length, concurrency]);

    useEffect(() => {
        return () => {
            cacheRef.current.forEach((v, k) => {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                if (v && createdRef.current.has(k)) {
                    try { URL.revokeObjectURL(v); } catch (e) { }
                }
            });
            // eslint-disable-next-line react-hooks/exhaustive-deps
            cacheRef.current.clear();
            createdRef.current.clear();
        };
    }, []);

    return cacheRef.current;
}

export default function TopCarousel({ items = [], onOpenGame }) {
    const [index, setIndex] = useState(0);
    const [pageNumber, setPageNumber] = useState(0);
    const rootRef = useRef(null);
    const windowRef = useRef(null);
    const trackRef = useRef(null);

    const visibleCount = useResponsiveCount();
    const length = items.length || 0;
    const pages = Math.max(1, Math.ceil(length / visibleCount));

    const [animating, setAnimating] = useState(false);
    const animDirectionRef = useRef(1);
    const [buffer, setBuffer] = useState([]);
    const [translatePx, setTranslatePx] = useState(0);

    const gap = 20;
    const [itemWidth, setItemWidth] = useState(0);

    const TRANS_MS = 420;
    const FINISH_PAD = 70;
    const animTimeoutRef = useRef(null);
    const autoTimerRef = useRef(null);
    const indexRef = useRef(index);
    const animatingRef = useRef(animating);

    const blobCache = useBlobCache(items, 6);

    useEffect(() => { indexRef.current = index; }, [index]);

    useEffect(() => { animatingRef.current = animating; }, [animating]);

    useEffect(() => {
        const handleVisible = () => {
            if (document.visibilityState === "visible") {
                if (!trackRef.current) return;
                if (!animatingRef.current) return;
                if (animTimeoutRef.current) {
                    clearTimeout(animTimeoutRef.current);
                    animTimeoutRef.current = null;
                }
                const currIndex = indexRef.current;
                const nextIndex = mod(currIndex + animDirectionRef.current * visibleCount, length);
                setAnimating(false);
                setBuffer(buildDisplay(nextIndex, visibleCount, items));
                setTranslatePx(0);
                setIndex(nextIndex);
            }
        };

        document.addEventListener("visibilitychange", handleVisible);
        window.addEventListener("focus", handleVisible);
        return () => {
            document.removeEventListener("visibilitychange", handleVisible);
            window.removeEventListener("focus", handleVisible);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleCount, items, length]);

    useEffect(() => {
        setBuffer(buildDisplay(index, visibleCount, items));
        setTranslatePx(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, visibleCount, items.length]);

    useEffect(() => {
        if (!windowRef.current) return;
        const ro = new ResizeObserver(() => recalcItemWidth());
        ro.observe(windowRef.current);
        recalcItemWidth();
        window.addEventListener("resize", recalcItemWidth);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", recalcItemWidth);
        };
        function recalcItemWidth() {
            const win = windowRef.current;
            if (!win) return;
            const totalGap = gap * (visibleCount - 1);
            const w = Math.max(0, win.clientWidth - 10 - totalGap);
            const per = Math.floor(w / visibleCount);
            setItemWidth(per);
        }
    }, [visibleCount]);

    useEffect(() => {
        if (autoTimerRef.current) {
            clearInterval(autoTimerRef.current);
            autoTimerRef.current = null;
        }
        if (length <= visibleCount) return;
        if (!itemWidth || itemWidth <= 0) return;
        autoTimerRef.current = setInterval(() => {
            if (!animating) triggerGo(1);
        }, 3000);
        return () => {
            if (autoTimerRef.current) {
                clearInterval(autoTimerRef.current);
                autoTimerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibleCount, length, animating, itemWidth]);

    useEffect(() => {
        return () => {
            if (animTimeoutRef.current) {
                clearTimeout(animTimeoutRef.current);
                animTimeoutRef.current = null;
            }
            if (autoTimerRef.current) {
                clearInterval(autoTimerRef.current);
                autoTimerRef.current = null;
            }
        };
    }, []);

    function buildDisplay(startIdx, count, arr) {
        const out = [];
        const n = arr.length || 0;
        if (!n) return out;
        for (let i = 0; i < Math.min(count, n); i++) {
            const idx = mod(startIdx + i, n);
            const it = arr[idx];
            if (it) out.push(it);
        }
        return out;
    }

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    const finalizeAnimation = (nextIndex) => {
        setAnimating(false);
        setBuffer(buildDisplay(nextIndex, visibleCount, items));
        setTranslatePx(0);
        setIndex(nextIndex);
    };

    const triggerGo = (dir) => {
        if (animating) return;
        if (length <= visibleCount) return;
        if (!itemWidth || itemWidth <= 0) return;
        animDirectionRef.current = dir;
        const nextIndex = mod(index + dir * visibleCount, length);
        const prevIndex = mod(index - visibleCount, length);

        const current = buildDisplay(index, visibleCount, items);
        const next = buildDisplay(nextIndex, visibleCount, items);
        const prev = buildDisplay(prevIndex, visibleCount, items);

        const rawStep = (itemWidth + gap) * visibleCount;
        const step = Math.round(rawStep);

        let combined, initialTranslate, targetTranslate;

        if (dir === 1) {
            combined = [...current, ...next];
            initialTranslate = 0;
            targetTranslate = -step;
        } else {
            combined = [...prev, ...current];
            initialTranslate = -step;
            targetTranslate = 0;
        }

        setPageNumber(p => (p + pages + dir) % pages);

        if (animTimeoutRef.current) {
            clearTimeout(animTimeoutRef.current);
            animTimeoutRef.current = null;
        }

        setBuffer(combined);
        setTranslatePx(initialTranslate);
        setAnimating(false);

        requestAnimationFrame(() => {
            if (trackRef.current) trackRef.current.getBoundingClientRect();
            setAnimating(true);
            requestAnimationFrame(() => {
                setTranslatePx(targetTranslate);
            });
        });

        animTimeoutRef.current = setTimeout(() => {
            animTimeoutRef.current = null;
            finalizeAnimation(nextIndex);
        }, TRANS_MS + FINISH_PAD);
    };

    const go = (dir) => {
        triggerGo(dir);
    };

    const display = useMemo(() => {
        if (animating) return buffer.slice(0, visibleCount * 2);
        return buildDisplay(index, visibleCount, items);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animating, buffer, index, visibleCount, items]);

    return (
        <div className="top-carousel" ref={rootRef}>
            <img className="carousel-arrow left" onClick={() => go(-1)} aria-label="Previous" src={leftArrow} alt="left" />
            <div className="carousel-window" ref={windowRef}>
                <div
                    className="carousel-track"
                    ref={trackRef}
                    style={{
                        transform: `translate3d(${translatePx}px,0,0)`,
                        transition: animating ? `transform ${TRANS_MS}ms cubic-bezier(.2,.9,.2,1)` : "none",
                        gap: `${gap}px`,
                    }}
                >
                    {display.map((g, idx) => (
                        <div
                            key={g.id + "-" + idx}
                            className="carousel-item"
                            style={{ flex: `0 0 ${itemWidth}px`, width: `${itemWidth}px`, height: `${itemWidth}px` }}
                        >
                            <GameCard game={g} onOpen={() => onOpenGame(g)} imageBlobUrl={blobCache.get(g.imageFileTitle) || null} />
                        </div>
                    ))}
                </div>
            </div>
            <img className="carousel-arrow right" onClick={() => go(1)} aria-label="Next" src={rightArrow} alt="right" />

            <div className="carousel-indicators">
                {Array.from({ length: pages }).map((_, i) => (
                    <div key={i} className={`indicator ${i === pageNumber ? "active" : ""}`} />
                ))}
            </div>
        </div>
    );
}

function useResponsiveCount() {
    const [count, setCount] = useState(calc());
    useEffect(() => {
        const onR = () => setCount(calc());
        window.addEventListener("resize", onR);
        return () => window.removeEventListener("resize", onR);
    }, []);
    return count;
    function calc() {
        const w = window.innerWidth;
        if (w < 550) return 1;
        if ((w < 1200 && w > 899) || w < 700) return 2;
        return 3;
    }
}
