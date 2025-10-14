import React from "react";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

import "../css/MainPage.css";
import "../css/Header.css";

export default function Header({ search, onSearchChange, currentUser }) {
    const isAdmin = currentUser?.isAdmin;

    return (
        <header className="site-header">
            <div className="header-inner">
                <div className="header-left">
                    <Link to="/" className="logo">GameAssistant</Link>
                </div>

                <div className="header-center">
                    <input
                        className="search-input"
                        placeholder="Поиск игр..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="header-right">
                    {isAdmin && (
                        <Link to="/admin" className="admin-link">Админка</Link>
                    )}

                    <UserMenu currentUser={currentUser} />
                </div>

            </div>
        </header>
    );
}