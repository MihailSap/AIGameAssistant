import React from "react";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import logo from "../img/LOGO.svg";
import searchIcon from "../img/search-icon.svg";
import "../css/Header.css";

export default function Header({ search = null, onSearchChange, currentUser, title }) {
    const isAdmin = currentUser?.isAdmin;
    return (
        <header className={"site-header"}>
            <div className={`header-inner ${isAdmin ? "admin" : ""}`}>
                <div className={`header-left`}>
                    <Link to="/" className="logo"><img src={logo} alt="AIGameAssistant" /></Link>
                </div>

                <div className={"header-center"}>
                    {search !== null &&
                        <div className="search-wrap">
                            <input
                                className="search-input"
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            <span className="search-icon" aria-hidden="true"><img src={searchIcon} alt="Поиск" /></span>
                        </div>
                    }
                    {title &&
                        <h1 className="header-page-title">{title}</h1>
                    }
                </div>

                <div className="header-right">
                    {isAdmin && <Link to="/admin" className="link">Админка</Link>}
                    <UserMenu currentUser={currentUser} />
                </div>
            </div>
            {search !== null &&
                <div className={"header-center header-mobile-search"}>
                    <div className="search-wrap">
                        <input
                            className="search-input"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <span className="search-icon" aria-hidden="true"><img src={searchIcon} alt="Поиск" /></span>
                    </div>
                </div>
            }
        </header>
    );
}
