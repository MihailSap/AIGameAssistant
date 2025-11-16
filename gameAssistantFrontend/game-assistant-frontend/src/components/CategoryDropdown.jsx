import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "../css/CategoryDropdown.css";
import { gameApi } from "../api/game";
import { getAllBackendCategories, backendToLabel } from "../utils/categories";

let categoriesCache = null;

export default function CategoryDropdown({ value = null, onChange, portalThreshold = 670 }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const rootRef = useRef(null);
    const dropdownRef = useRef(null);
    const coordsRef = useRef({ top: 0, left: 0, width: 240 });
    const [usePortal, setUsePortal] = useState(typeof window !== "undefined" ? window.innerHeight >= portalThreshold : true);
    const [, setRerender] = useState(0);

    useEffect(() => {
        const local = getAllBackendCategories();
        setItems(local);

        if (categoriesCache) {
            setItems(categoriesCache);
            return;
        }

        let mounted = true;
        setLoading(true);
        (async () => {
            try {
                const data = await gameApi.getCategories();
                if (!mounted) return;
                const arr = Array.isArray(data) ? data : local;
                categoriesCache = arr;
                setItems(arr);
            } catch (err) {
                if (!mounted) return;
                setItems(local);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        const onResize = () => {
            const now = window.innerHeight >= portalThreshold;
            setUsePortal(now);
        };
        const onOrientation = () => {
            const now = window.innerHeight >= portalThreshold;
            setUsePortal(now);
        };
        window.addEventListener("resize", onResize, { passive: true });
        window.addEventListener("orientationchange", onOrientation);
        return () => {
            window.removeEventListener("resize", onResize);
            window.removeEventListener("orientationchange", onOrientation);
        };
    }, [portalThreshold]);

    useEffect(() => {
        const onDocClick = (e) => {
            const root = rootRef.current;
            const dd = dropdownRef.current;
            const target = e.target;
            if (root && root.contains(target)) return;
            if (dd && dd.contains(target)) return;
            setOpen(false);
        };

        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("click", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    useEffect(() => {
        if (!open || !usePortal) return;

        const update = () => {
            const btn = rootRef.current;
            if (!btn) return;
            const r = btn.getBoundingClientRect();
            coordsRef.current = {
                top: r.bottom + window.scrollY,
                left: r.left + window.scrollX,
                width: Math.max(160, r.width)
            };
            setRerender(v => v + 1);
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(document.documentElement);
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [open, usePortal]);

    const handleSelect = (cat) => {
        if (onChange) onChange(cat);
        setOpen(false);
    };

    const display = value ? backendToLabel(value) : "Категория игр";

    const portalList = (
        <ul
            ref={dropdownRef}
            className={usePortal ? "catdd-portal-list" : "catdd-list"}
            role="listbox"
            aria-label="Категории игр"
            style={usePortal ? {
                position: "absolute",
                top: `${coordsRef.current.top}px`,
                left: `${coordsRef.current.left}px`,
                width: `${coordsRef.current.width}px`,
            } : {
                position: "absolute"
            }}
        >
            <li
                // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                role="option"
                tabIndex={0}
                className={`catdd-item ${value == null ? "selected" : ""}`}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(null); }}
                onClick={(e) => { e.stopPropagation(); }}
                onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleSelect(null); }}
            >
                —
            </li>

            {items.map((it) => (
                <li
                    key={it}
                    // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                    role="option"
                    tabIndex={0}
                    className={`catdd-item ${value === it ? "selected" : ""}`}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(it); }}
                    onClick={(e) => { e.stopPropagation(); }}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleSelect(it); }}
                >
                    {backendToLabel(it)}
                </li>
            ))}
        </ul>
    );

    return (
        <>
            <div className="catdd-root" ref={rootRef}>
                <button
                    type="button"
                    className={`catdd-button ${open ? "open" : ""} ${display === "Категория игр" ? "unset" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                >
                    <span className="catdd-label">{loading ? "Загрузка..." : display}</span>
                    <span className="catdd-arrow" aria-hidden>
                        {open ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 15l6-6 6 6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </span>
                </button>

                {!usePortal && open && portalList}
            </div>

            {usePortal && open && ReactDOM.createPortal(portalList, document.body)}
        </>
    );
}
