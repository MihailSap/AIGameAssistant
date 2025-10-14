import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "../css/AuthPages.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  let isFormValid = false;

  const handleSubmit = async (e) => {
    if (!isFormValid) {
      return;
    }

    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Ошибка входа. Проверьте корректность введённых данных.");
    }
  };

  isFormValid = email && password && password.length >= 4;

  return (
    <div className="auth-root">
      <div className="auth-container">
        <div className="auth-card" role="region" aria-labelledby="login-title">
          <header className="auth-header">
            <h1 id="login-title" className="auth-title">Вход</h1>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-row">
              <label className="auth-form-label" htmlFor="login-email">Электронная почта</label>
              <input
                id="login-email"
                name="email"
                className="auth-form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                maxLength={50}
                required
                autoComplete="email"
                aria-invalid={!!error}
              />
            </div>

            <div className="auth-form-row">
              <label className="auth-form-label" htmlFor="login-password">Пароль</label>
              <input
                id="login-password"
                name="password"
                type="password"
                className="auth-form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                maxLength={30}
                required
                autoComplete="current-password"
                aria-invalid={!!error}
              />
            </div>

            {error && <div className="auth-form-error" role="alert">{error}</div>}

            <div className="auth-form-actions">
              <button type="submit" className="btn btn-primary" disabled={!isFormValid} aria-disabled={!isFormValid}>
                Войти
              </button>
            </div>

            <div className="auth-footer">
              <span>Нет аккаунта?</span>
              <Link to="/register" className="auth-link">Зарегистрироваться</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
