import React from "react";
import "../css/ToggleSlider.css";

export default function ToggleSlider({
    leftLabel,
    rightLabel,
    value = false,
    onChange = () => { }
}) {
    const switchTo = (v) => {
        if (v === value) return;
        onChange(v);
    };

    return (
        <div className="ts-tabs" role="tablist" aria-label="Переключатель режимов">
            <button
                role="tab"
                aria-selected={!value}
                className={`ts-tab ${value ? "active" : ""}`}
                onClick={() => switchTo(true)}
                type="button"
            >
                {leftLabel}
            </button>
            <button
                role="tab"
                aria-selected={value}
                className={`ts-tab ${!value ? "active" : ""}`}
                onClick={() => switchTo(false)}
                type="button"
            >
                {rightLabel}
            </button>

            <div className={`ts-tab-slider ${!value ? "right" : "left"}`} aria-hidden="true" />
        </div>
    );
}
