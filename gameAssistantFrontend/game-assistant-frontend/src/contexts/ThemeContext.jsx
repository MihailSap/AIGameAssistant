import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        try {
            return localStorage.getItem("theme-mode") || "auto";
        } catch {
            return "auto";
        }
    });

    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            const stored = localStorage.getItem("theme-mode") || "auto";
            if (stored === "auto") {
                return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }
            return stored;
        } catch {
            return "dark";
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("theme-mode", mode);
        } catch { }

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const applyTheme = () => {
            const theme = mode === "auto" ? (mq.matches ? "dark" : "light") : mode;
            document.documentElement.setAttribute("data-theme", theme);
            setCurrentTheme(theme);
        };

        applyTheme();

        const handler = () => {
            if (mode === "auto") applyTheme();
        };

        if (mq.addEventListener) mq.addEventListener("change", handler);
        else if (mq.addListener) mq.addListener(handler);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", handler);
            else if (mq.removeListener) mq.removeListener(handler);
        };
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, currentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
