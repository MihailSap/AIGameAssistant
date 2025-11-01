import { apiClient } from "./axios";
import { setTokens, clearTokens, getRefreshToken } from "../utils/storage";
import { markUserLoggedOut } from "./axios";

function buildFormData(userRequestDTO) {
  console.log(userRequestDTO);
  const fd = new FormData();
  if (userRequestDTO.email !== undefined && userRequestDTO.email !== null) fd.append("email", userRequestDTO.email);
  if (userRequestDTO.login !== undefined && userRequestDTO.login !== null) fd.append("login", userRequestDTO.login);
  if (userRequestDTO.password !== undefined && userRequestDTO.password !== null) fd.append("password", userRequestDTO.password);
  fd.append("isAdmin", false);
  return fd;
}

export const authApi = {
  login: async ({ email, password }) => {
    const resp = await apiClient.post("/api/auth/login", { email, password });
    setTokens({ accessToken: resp.data.accessToken, refreshToken: resp.data.refreshToken });
    return resp.data;
  },

  register: async (userRequestDTO) => {
    const fd = buildFormData(userRequestDTO);
    const resp = await apiClient.post("/api/auth/register", fd);
    return resp.data;
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
  }
};
