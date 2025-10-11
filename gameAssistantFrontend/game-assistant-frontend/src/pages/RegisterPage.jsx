import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { validateEmail } from "../utils/utils.js";
import "../css/AuthPages.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userLogin, setUserLogin] = useState("");
  const [error, setError] = useState(null);
  const [passwordAgain, setPasswordAgain] = useState('');
  const [emailError, setEmailError] = useState('');
  const [userLoginError, setUserLoginError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordAgainError, setPasswordAgainError] = useState('');
  let isFormValid = false;
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const vaildateResult = validateEmail(value);
    if (!vaildateResult.isValid) {
      setEmailError(vaildateResult.message);
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 4) {
      setPasswordError('Слишком короткий пароль');
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordAgainChange = (e) => {
    const value = e.target.value;
    setPasswordAgain(value);
    if (value && value !== password) {
      setPasswordAgainError('Пароли не совпадают');
    } else {
      setPasswordAgainError('');
    }
  };

  const handleUserLoginChange = (e) => {
    const value = e.target.value;
    setUserLogin(value);
    if (!value) {
      setUserLoginError('Обязательное поле');
    } else {
      setUserLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    if (!isFormValid) {
      return;
    }

    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ email, "login": userLogin, password });

      try {
        await login({ email, password });
        navigate("/");
      } catch (loginErr) {
        const loginMessage =
          loginErr?.response?.data?.message ||
          "Регистрация прошла, но автоматический вход не удался. Введите данные для входа.";
        setError(loginMessage);
        navigate("/login");
      }
    } catch (regErr) {
      setError(regErr?.response?.data?.message || "Ошибка регистрации. Возможно, пользователь с таким email уже существует.");
    } finally {
      setLoading(false);
    }
  };

  isFormValid = email && userLogin && password && passwordAgain && !emailError && !userLoginError && !passwordError && !passwordAgainError;

  return (
    <div className="auth-root">
      <div className="auth-container">
        <div className="auth-card" role="region" aria-labelledby="register-title">
          <header className="auth-header">
            <h1 id="register-title" className="auth-title">Регистрация</h1>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-row">
              <label className="auth-form-label" htmlFor="reg-login">Логин</label>
              <input
                id="reg-login"
                name="login"
                className="auth-form-input"
                value={userLogin}
                onChange={handleUserLoginChange}
                maxLength={30}
                required
                autoComplete="name"
                aria-invalid={!!userLoginError}
                aria-describedby={userLoginError ? "reg-login-error" : undefined}
              />
              {userLoginError && <div id="reg-login-error" className="field-error" role="alert">{userLoginError}</div>}
            </div>

            <div className="auth-form-row">
              <label className="auth-form-label" htmlFor="reg-email">Электронная почта</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="auth-form-input"
                value={email}
                onChange={handleEmailChange}
                maxLength={50}
                required
                autoComplete="email"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "reg-email-error" : undefined}
              />
              {emailError && <div id="reg-email-error" className="field-error" role="alert">{emailError}</div>}
            </div>

            <div className="auth-form-row">
              <label className="auth-form-label" htmlFor="reg-password">Пароль</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="auth-form-input"
                value={password}
                onChange={handlePasswordChange}
                maxLength={30}
                required
                autoComplete="new-password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "reg-password-error" : undefined}
              />
              {passwordError && <div id="reg-password-error" className="field-error" role="alert">{passwordError}</div>}
            </div>

            <div className="auth-form-row">
              <label className="auth-form-label" htmlFor="reg-password-again">Повторите пароль</label>
              <input
                id="reg-password-again"
                name="passwordAgain"
                type="password"
                className="auth-form-input"
                value={passwordAgain}
                onChange={handlePasswordAgainChange}
                maxLength={30}
                required
                autoComplete="new-password"
                aria-invalid={!!passwordAgainError}
                aria-describedby={passwordAgainError ? "reg-password-again-error" : undefined}
              />
              {passwordAgainError && <div id="reg-password-again-error" className="field-error" role="alert">{passwordAgainError}</div>}
            </div>

            {error && <div className="auth-form-error" role="alert">{error}</div>}

            <div className="auth-form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading || !isFormValid} aria-disabled={loading || !isFormValid}>
                {loading ? "Обработка..." : "Зарегистрироваться"}
              </button>
            </div>

            <div className="auth-footer">
              <span>Есть аккаунт?</span>
              <Link to="/login" className="auth-link">Войти</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
