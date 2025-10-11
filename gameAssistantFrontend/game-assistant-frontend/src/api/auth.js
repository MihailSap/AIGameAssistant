import { apiClient } from "./axios";
import { setTokens, clearTokens, getRefreshToken } from "../utils/storage";
import { markUserLoggedOut } from "./axios";

export const authApi = {
  async login({ email, password }) {
    const resp = await apiClient.post("/api/auth/login", { email, password });
    setTokens({ accessToken: resp.data.accessToken, refreshToken: resp.data.refreshToken });
    return resp.data;
  },

  async register(userDTO) {
    const resp = await apiClient.post("/api/auth/register", userDTO);
    return resp.data;
  },

  async logout() {
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

  async refreshAccessToken() {
    const refreshToken = getRefreshToken();
    const resp = await apiClient.post("/api/auth/token", { refreshToken });
    if (!resp?.data?.accessToken) throw new Error("refresh failed: no access token");
    setTokens({ accessToken: resp.data.accessToken });
    return resp.data;
  },

  async refreshRefreshToken() {
    const refreshToken = getRefreshToken();
    const resp = await apiClient.post("/api/auth/refresh", { refreshToken });
    if (!resp?.data?.accessToken) throw new Error("refresh failed: no access token");
    setTokens({ accessToken: resp.data.accessToken, refreshToken: resp.data.refreshToken });
    return resp.data;
  }
};
