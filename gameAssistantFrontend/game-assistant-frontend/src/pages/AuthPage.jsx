import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { validateEmail } from "../utils/utils";
import "../css/AuthPages.css";
import logo from "../img/LOGO.svg";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialMode = useMemo(() => {
    const p = (location.pathname || "").toLowerCase();
    if (p.includes("register")) return "register";
    if (p.includes("login")) return "login";
    const qp = new URLSearchParams(location.search).get("mode");
    if (qp === "register") return "register";
    return "login";
  }, [location]);

  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    const target = m === "register" ? "/register" : "/login";
    navigate(target, { replace: false });
  };

  return (
    <div className="auth-root">
      <div className="auth-bg" role="presentation" aria-hidden="true" />
      <div className="auth-top">
        <Link to="/" className="auth-logo-link" aria-label="На главную">
          <div className="auth-logo"><img src={logo} alt="AIGameAssistant" /></div>
        </Link>
      </div>

      <div className="auth-container">
        <div className="auth-left-container" />
        <div className="auth-right-container" aria-hidden="true">
          <h1 className="auth-hello">Добро пожаловать!</h1>
          <div className="auth-card" role="region" aria-labelledby="auth-title">
            <div className="auth-tabs" role="tablist" aria-label="Аутентификация">
              <button
                role="tab"
                aria-selected={mode === "login"}
                className={`auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Вход
              </button>
              <button
                role="tab"
                aria-selected={mode === "register"}
                className={`auth-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => switchMode("register")}
              >
                Регистрация
              </button>
              <div className={`auth-tab-slider ${mode === "register" ? "right" : "left"}`} aria-hidden="true" />
            </div>

            <div className="auth-form-wrap">
              {mode === "login" ? (
                <LoginForm onSuccess={() => navigate("/")} />
              ) : (
                <RegisterForm onSuccess={() => navigate("/")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  let isFormValid = Boolean(email && password && password.length >= 4);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      onSuccess && onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Ошибка входа. Проверьте корректность введённых данных.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-inputs">
        <input
          id="login-email"
          name="email"
          className="auth-form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          maxLength={50}
          required
          placeholder="Введите e-mail"
          autoComplete="email"
          aria-invalid={!!error}
        />

        <input
          id="login-password"
          name="password"
          type="password"
          className="auth-form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          maxLength={30}
          required
          placeholder="Введите пароль"
          autoComplete="current-password"
          aria-invalid={!!error}
        />
      </div>

      {error && <div className="auth-form-error" role="alert">{error}</div>}

      <div className="auth-form-actions">
        <button type="submit" className="btn" disabled={!isFormValid || submitting} aria-disabled={!isFormValid || submitting}>
          {submitting ? "Вход..." : "Войти"}
        </button>
        <div className="auth-footer">
          <span>Нет аккаунта?</span>
          <Link to="/register" className="auth-link">Зарегистрироваться</Link>
        </div>
      </div>
    </form>
  );
}

function RegisterForm({ onSuccess }) {
  const { register, login } = useAuth();

  const [email, setEmail] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [emailError, setEmailError] = useState("");
  const [userLoginError, setUserLoginError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordAgainError, setPasswordAgainError] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const r = validateEmail(value);
    setEmailError(r.isValid ? "" : r.message || "Некорректный email");
  };

  const handleUserLoginChange = (e) => {
    const v = e.target.value;
    setUserLogin(v);
    setUserLoginError(v ? "" : "Обязательное поле");
  };

  const handlePasswordChange = (e) => {
    const v = e.target.value;
    setPassword(v);
    setPasswordError(v && v.length < 4 ? "Слишком короткий пароль" : "");
    if (passwordAgain && v !== passwordAgain) {
      setPasswordAgainError("Пароли не совпадают");
    } else {
      setPasswordAgainError("");
    }
  };

  const handlePasswordAgainChange = (e) => {
    const v = e.target.value;
    setPasswordAgain(v);
    setPasswordAgainError(v && v !== password ? "Пароли не совпадают" : "");
  };

  const isFormValid = Boolean(
    email &&
    userLogin &&
    password &&
    passwordAgain &&
    !emailError &&
    !userLoginError &&
    !passwordError &&
    !passwordAgainError
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setError(null);
    setLoading(true);

    try {
      await register({ email, login: userLogin, password });
      try {
        await login({ email, password });
        onSuccess && onSuccess();
      } catch (loginErr) {
        const loginMessage =
          loginErr?.response?.data?.message ||
          "Регистрация прошла, но автоматический вход не удался. Введите данные для входа.";
        setError(loginMessage);
      }
    } catch (regErr) {
      setError(regErr?.response?.data?.message || "Ошибка регистрации. Возможно, пользователь с таким email уже существует.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-inputs">
        <div className="auth-form-row">
          <input
            id="reg-login"
            name="login"
            className="auth-form-input"
            value={userLogin}
            onChange={handleUserLoginChange}
            maxLength={30}
            required
            placeholder="Введите имя пользователя"
            autoComplete="name"
            aria-invalid={!!userLoginError || !!error}
            aria-describedby={userLoginError ? "reg-login-error" : undefined}
          />
          {userLoginError && <div id="reg-login-error" className="field-error" role="alert">{userLoginError}</div>}
        </div>

        <div className="auth-form-row">
          <input
            id="reg-email"
            name="email"
            type="email"
            className="auth-form-input"
            value={email}
            onChange={handleEmailChange}
            maxLength={50}
            required
            placeholder="Введите e-mail"
            autoComplete="email"
            aria-invalid={!!emailError || !!error}
            aria-describedby={emailError ? "reg-email-error" : undefined}
          />
          {emailError && <div id="reg-email-error" className="field-error" role="alert">{emailError}</div>}
        </div>

        <div className="auth-form-row">
          <input
            id="reg-password"
            name="password"
            type="password"
            className="auth-form-input"
            value={password}
            onChange={handlePasswordChange}
            maxLength={30}
            required
            placeholder="Введите пароль"
            autoComplete="new-password"
            aria-invalid={!!passwordError || !!error}
            aria-describedby={passwordError ? "reg-password-error" : undefined}
          />
          {passwordError && <div id="reg-password-error" className="field-error" role="alert">{passwordError}</div>}
        </div>

        <div className="auth-form-row">
          <input
            id="reg-password-again"
            name="passwordAgain"
            type="password"
            className="auth-form-input"
            value={passwordAgain}
            onChange={handlePasswordAgainChange}
            maxLength={30}
            required
            placeholder="Повторите пароль"
            autoComplete="new-password"
            aria-invalid={!!passwordAgainError || !!error}
            aria-describedby={passwordAgainError ? "reg-password-again-error" : undefined}
          />
          {passwordAgainError && <div id="reg-password-again-error" className="field-error" role="alert">{passwordAgainError}</div>}
        </div>
      </div>
      
      {error && <div className="auth-form-error" role="alert">{error}</div>}

      <div className="auth-form-actions">
        <button type="submit" className="btn" disabled={!isFormValid || loading} aria-disabled={!isFormValid || loading}>
          {loading ? "Обработка..." : "Зарегистрироваться"}
        </button>
        <div className="auth-footer">
          <span>Есть аккаунт?</span>
          <Link to="/login" className="auth-link">Войти</Link>
        </div>
      </div>
    </form>
  );
}
