import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logo from "../img/LOGO.svg";
import "../css/AuthPages.css";
import "../css/VerifyEmailPages.css";

export default function VerifyEmailPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { confirmEmail } = useAuth();

    const token = useMemo(() => {
        return new URLSearchParams(location.search).get("token");
    }, [location.search]);

    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const verify = async () => {
            try {
                await confirmEmail(token);
                setStatus("success");
                setTimeout(() => navigate("/"), 2000);
            } catch {
                setStatus("error");
                setTimeout(() => navigate("/login"), 2000);
            }
        };

        verify();
    }, [token, confirmEmail, navigate]);

    return (
        <div className="auth-root verify-email-page">
            <div className="auth-bg" role="presentation" aria-hidden="true" />
            <div className="auth-top">
                <Link to="/" className="auth-logo-link" aria-label="На главную">
                    <div className="auth-logo">
                        <img src={logo} alt="AIGameAssistant" />
                    </div>
                </Link>
            </div>

            <div className="verify-container">
                <h1 className="verify-title">Подтверждение почты</h1>
                {status === "loading" && (
                    <div className="verify-message verify-loading-message">
                        Идет подтверждение почты...
                    </div>
                )}

                {status === "success" && (
                    <div className="verify-message verify-success-message">
                        Почта успешно подтверждена!
                    </div>
                )}

                {status === "error" && (
                    <div className="verify-message verify-error-message">
                        Не удалось подтвердить почту
                    </div>
                )}
            </div>
        </div>
    );
}
