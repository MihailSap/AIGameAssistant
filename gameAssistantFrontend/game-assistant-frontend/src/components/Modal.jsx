import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "../css/Modal.css";

export default function Modal({ children, onClose }) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev || "";
        };
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return ReactDOM.createPortal(
        <div className="modal-backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modal-body">{children}</div>
            </div>
        </div>,
        document.body
    );
}
