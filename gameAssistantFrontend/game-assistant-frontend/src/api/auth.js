import { apiClient } from "./axios";
import { setTokens, clearTokens, getRefreshToken } from "../utils/storage";
import { markUserLoggedOut } from "./axios";

export const authApi = {
  login: async ({ email, password }) => {
    try {
    const resp = await apiClient.post("/api/auth/login", { email, password });
    setTokens({ accessToken: resp.data.accessToken, refreshToken: resp.data.refreshToken });
    return resp.data;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  register: async ({ email, login, password }) => {
    try {
      const resp = await apiClient.post("/api/auth/register", { email, login, password });
      return resp.data;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiClient.post("/api/auth/logout", { refreshToken });
      }
    } catch (err) {
    } finally {
      markUserLoggedOut();
      clearTokens();
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = getRefreshToken();
    const resp = await apiClient.post("/api/auth/token", { refreshToken });
    if (!resp?.data?.accessToken) throw new Error("refresh failed: no access token");
    setTokens({ accessToken: resp.data.accessToken });
    return resp.data;
  },

  refreshRefreshToken: async () => {
    const refreshToken = getRefreshToken();
    const resp = await apiClient.post("/api/auth/refresh", { refreshToken });
    if (!resp?.data?.accessToken) throw new Error("refresh failed: no access token");
    setTokens({ accessToken: resp.data.accessToken, refreshToken: resp.data.refreshToken });
    return resp.data;
  },

  confirmUserEmail: async (token) => {
    try {
      const resp = await apiClient.post("/api/auth/verify-email", null, { params: { token } });
      setTokens({ accessToken: resp.data.accessToken, refreshToken: resp.data.refreshToken });
      return resp.data;
    } catch (error) {
      console.error("Error confirming user email:", error);
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const resp = await apiClient.post("/api/auth/forgot-password", null, { params: { email } });
      return resp.data;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const resp = await apiClient.patch("/api/auth/reset-password", { token, password });
      return resp.data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },
};
