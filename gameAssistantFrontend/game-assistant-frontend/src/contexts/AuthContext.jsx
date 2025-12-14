import React, { createContext, useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { getAccessToken } from "../utils/storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAccessToken());
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      await authApi.login(credentials);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userDTO) => {
    setLoading(true);
    try {
      return await authApi.register(userDTO);
    } finally {
      setLoading(false);
    }
  };

  const confirmEmail = async (token) => {
    setLoading(true);
    try {
      await authApi.confirmUserEmail(token);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      setIsAuthenticated(false);
      window.location.href = "/login";
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, login, register, confirmEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
