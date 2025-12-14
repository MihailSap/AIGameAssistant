import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { validateEmail } from "../utils/utils";
import logo from "../img/LOGO.svg";
import "../css/AuthPages.css";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = useMemo(() => {
    return new URLSearchParams(location.search).get("token");
  }, [location.search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordAgainError, setPasswordAgainError] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const r = validateEmail(value);
    setEmailError(r.isValid ? "" : r.message || "Некорректный email");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    if (!token) {
      try {
        if (!email || emailError) return;
        await authApi.requestPasswordReset(email);
        setSuccess("Ссылка для сброса пароля отправлена на указанный email.");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || "Произошла ошибка. Попробуйте еще раз.");
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        if (!password || !passwordAgain || passwordError || passwordAgainError) return;
        await authApi.resetPassword(token, password);
        setSuccess("Пароль успешно изменён.");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        setError(err?.response?.data?.message || "Произошла ошибка. Попробуйте позже.");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const isEmailFormValid = Boolean(email && !emailError);
  const isPasswordFormValid = Boolean(
    password &&
    passwordAgain &&
    !passwordError &&
    !passwordAgainError
  );

  return (
    <div className="auth-root reset-password-page">
      <div className="auth-bg" role="presentation" aria-hidden="true" />
      <div className="auth-top">
        <Link to="/" className="auth-logo-link" aria-label="На главную">
          <div className="auth-logo">
            <img src={logo} alt="AIGameAssistant" />
          </div>
        </Link>
      </div>

      <div className="auth-container">
        <div className="auth-left-container" />
        <div className="auth-right-container" aria-hidden="true">
          <h1 className="auth-hello">Сброс пароля</h1>
          <div className="auth-card" role="region">
            <div className="auth-form-wrap">
              {!success && !(error && token) ? (
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                  <div className="auth-inputs">
                    {!token ? (
                      <>
                        <label className="auth-form-label">
                          Введите e-mail, указанный при регистрации, на него будет отправлена ссылка для сброса пароля
                        </label>
                        <div className="auth-form-row">
                          <input
                            type="text"
                            className="auth-form-input"
                            value={email}
                            onChange={handleEmailChange}
                            maxLength={50}
                            placeholder="Введите e-mail"
                            autoComplete="email"
                            aria-invalid={!!emailError}
                          />
                          {emailError && <div className="field-error">{emailError}</div>}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="auth-form-row">
                          <input
                            type="password"
                            className="auth-form-input"
                            value={password}
                            onChange={handlePasswordChange}
                            maxLength={30}
                            placeholder="Введите новый пароль"
                            autoComplete="new-password"
                            aria-invalid={!!passwordError}
                          />
                          {passwordError && <div className="field-error">{passwordError}</div>}
                        </div>
                        <div className="auth-form-row">
                          <input
                            type="password"
                            className="auth-form-input"
                            value={passwordAgain}
                            onChange={handlePasswordAgainChange}
                            maxLength={30}
                            placeholder="Повторите пароль"
                            autoComplete="new-password"
                            aria-invalid={!!passwordAgainError}
                          />
                          {passwordAgainError && <div className="field-error">{passwordAgainError}</div>}
                        </div>
                      </>
                    )}
                  </div>

                  {error && !token && <div className="auth-form-error">{error.slice(0, 100)}</div>}

                  <div className="auth-form-actions">
                    <button
                      type="submit"
                      className="btn"
                      disabled={
                        submitting ||
                        (!token && !isEmailFormValid) ||
                        (token && !isPasswordFormValid)
                      }
                    >
                      {submitting ? "Обработка..." : "Отправить"}
                    </button>

                    {!token && (
                      <div className="auth-footer">
                        <div className="auth-switch-link">
                          <span>Нет аккаунта?</span>
                          <Link to="/register" className="link">Зарегистрироваться</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              ) : success ? (
                <div className="auth-success-message">{success}</div>
              ) : (
                <div className="auth-error-message">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
