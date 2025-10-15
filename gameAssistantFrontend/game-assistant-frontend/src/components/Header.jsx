import React from "react";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import logo from "../img/LOGO.svg";

import "../css/MainPage.css";
import "../css/CatalogPage.css";
import "../css/Header.css";

export default function Header({ search, onSearchChange, currentUser, main = false, admin = false }) {
    const location = useLocation();
    const isAdmin = currentUser?.isAdmin;

    return (
        <header className="site-header">
            <div className="header-inner">
                <div className="header-left">
                    <Link to="/" className="logo"><img src={logo} alt="AIGameAssistant"/></Link>
                </div>

                <div className="header-center">
                    {main ? (
                        <>
                            <Link to="/" className={`header-link ${location.pathname === '/' ? 'header-active' : ''}`}>Главная</Link>
                            <Link to="/games" className={`header-link ${location.pathname === '/games' ? 'header-active' : ''}`}>Каталог игр</Link>
                            <Link to="/games/ai" className={`header-link ${location.pathname === '/games/ai' ? 'header-active' : ''}`}>Чат</Link>
                        </>
                    ) : (
                        <input
                            className="search-input"
                            placeholder="Поиск игр..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    )}
                </div>

                <div className="header-right">
                    {(isAdmin && admin) && (
                        <Link to="/admin" className="admin-link">Админка</Link>
                    )}
                    <UserMenu currentUser={currentUser} />
                </div>

            </div>
        </header>
    );
}