import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import searchIcon from "../img/search-icon.svg";
import logo from "../img/LOGO.svg";
import "../css/Header.css";

export default function Header({ search = null, onSearchChange, currentUser, centralTitle }) {
    const isAdmin = currentUser?.isAdmin;
    const [scrolledPastHero, setScrolledPastHero] = useState(false);

    const handleScroll = () => {
        const heroAnchor = document.querySelector('.hero-anchor');
        const heroAnchorBottom = heroAnchor ? heroAnchor.offsetTop + heroAnchor.offsetHeight : 0;
        setScrolledPastHero(window.scrollY > heroAnchorBottom);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`site-header ${scrolledPastHero ? "scrolled-past-hero" : ""}`}>
            <div className={`header-inner ${isAdmin ? "admin" : ""}`}>
                <div className="header-left">
                    <Link to="/" className="logo">
                        <img src={logo} alt="AIGameAssistant" />
                    </Link>
                </div>

                <div className="header-center">
                    {search !== null && (
                        <div className="search-wrap">
                            <input
                                type="text"
                                className="search-input"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            <span className="search-icon" aria-hidden="true">
                                <img src={searchIcon} alt="Поиск" />
                            </span>
                        </div>
                    )}
                    {centralTitle && <h1 className="header-title">{centralTitle}</h1>}
                </div>

                <div className="header-right">
                    {isAdmin && <Link to="/admin" className="link admin-link">Админка</Link>}
                    <UserMenu currentUser={currentUser} />
                </div>
            </div>

            {(search !== null || centralTitle) && (
                <div className="header-center header-mobile">
                    {search !== null ? (
                        <div className="search-wrap">
                            <input
                                type="text"
                                className="search-input"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            <span className="search-icon" aria-hidden="true">
                                <img src={searchIcon} alt="Поиск" />
                            </span>
                        </div>
                    ) : (
                        <h1 className="header-title">{centralTitle}</h1>
                    )}
                </div>
            )}
        </header>
    );
}
