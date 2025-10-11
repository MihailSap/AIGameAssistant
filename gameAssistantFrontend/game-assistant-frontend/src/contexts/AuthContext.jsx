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
      const tokens = await authApi.login(credentials);
      setIsAuthenticated(true);
      return tokens;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userDTO) => {
    setLoading(true);
    try {
      const resp = await authApi.register(userDTO);
      return resp;
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
    <AuthContext.Provider value={{ isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
