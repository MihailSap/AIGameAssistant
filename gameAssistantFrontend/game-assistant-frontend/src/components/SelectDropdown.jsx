import React, { useEffect, useRef, useState } from "react";
import "../css/SelectDropdown.css";

const fetchCache = {};

export default function SelectDropdown({
    value = null,
    onChange,
    items = null,
    fetchItems = null,
    cacheKey = null,
    allowNull = true,
    placeholder = "Выбрать",
    labelFunc = (i) => String(i ?? ""),
    ariaLabel = "Выбор",
}) {
    const [open, setOpen] = useState(false);
    const [list, setList] = useState(Array.isArray(items) ? items : []);
    const [loading, setLoading] = useState(false);
    const rootRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (Array.isArray(items)) {
            setList(items);
            return;
        }
        let mounted = true;
        const load = async () => {
            if (!fetchItems) {
                setList([]);
                return;
            }
            if (cacheKey && fetchCache[cacheKey]) {
                setList(fetchCache[cacheKey]);
                return;
            }
            setLoading(true);
            try {
                const data = await fetchItems();
                if (!mounted) return;
                const arr = Array.isArray(data) ? data : [];
                if (cacheKey) fetchCache[cacheKey] = arr;
                setList(arr);
            } catch (e) {
                if (!mounted) return;
                setList([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [items, fetchItems, cacheKey]);

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

    const handleSelect = (it) => {
        if (onChange) onChange(it);
        setOpen(false);
    };

    const display = value == null ? placeholder : labelFunc(value);

    const sorted = Array.isArray(list)
        ? list.slice().sort((a, b) => {
            const ta = labelFunc(a);
            const tb = labelFunc(b);
            return ta.localeCompare(tb, 'ru', { sensitivity: 'base', numeric: true });
        })
        : [];

    return (
        <div className="seldd-root" ref={rootRef}>
            <button
                type="button"
                className={`seldd-button ${open ? "open" : ""} ${display === placeholder ? "unset" : ""}`}
                onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="seldd-label">{loading ? "Загрузка..." : display}</span>
                <span className="seldd-arrow" aria-hidden>
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

            {open && (
                <ul
                    ref={dropdownRef}
                    className="seldd-list"
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {allowNull && (
                        <li
                            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                            role="option"
                            tabIndex={0}
                            className={`seldd-item ${value == null ? "selected" : ""}`}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(null); }}
                            onClick={(e) => { e.stopPropagation(); }}
                            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleSelect(null); }}
                        >
                            —
                        </li>
                    )}

                    {loading && sorted.length === 0 && (
                        <li className="seldd-item disabled">Загрузка...</li>
                    )}

                    {!loading && sorted.length === 0 && (
                        <li className="seldd-item disabled">Пусто</li>
                    )}

                    {sorted.map((it) => (
                        <li
                            key={String(it)}
                            // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                            role="option"
                            tabIndex={0}
                            className={`seldd-item ${value === it ? "selected" : ""}`}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(it); }}
                            onClick={(e) => { e.stopPropagation(); }}
                            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleSelect(it); }}
                        >
                            {labelFunc(it)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
