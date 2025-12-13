import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/storage";

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 100000,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

export let isUserLoggedOut = false;

export function markUserLoggedOut() {
  isUserLoggedOut = true;
  onRefreshed(null);
  refreshSubscribers = [];
}

apiClient.interceptors.request.use(config => {
  if (isUserLoggedOut) {
    return config;
  }
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, err => Promise.reject(err));

apiClient.interceptors.response.use(
  res => res,
  async error => {
    if (isUserLoggedOut) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (originalRequest.url && (
      originalRequest.url.includes("/api/auth/token") ||
      originalRequest.url.includes("/api/auth/refresh") ||
      originalRequest.url.includes("/api/auth/logout")
    )) {
      return Promise.reject(error);
    }

    const accessToken = getAccessToken();

    if (error.response && (error.response.status === 401 || (accessToken && error.response.status === 403))) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(token => {
            if (!token) {
              reject(error);
              return;
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        let resp = await refreshClient.post("/api/auth/token", { refreshToken });
        let newAccessToken = resp?.data?.accessToken;
        let newRefreshToken;

        if (!newAccessToken) {
          resp = await refreshClient.post("/api/auth/refresh", { refreshToken });
          newAccessToken = resp?.data?.accessToken;
          newRefreshToken = resp?.data?.refreshToken;
        }

        if (!newAccessToken) {
          clearTokens();
          isRefreshing = false;
          onRefreshed(null);
          window.location.href = "/login";
          return Promise.reject(new Error("refresh failed: no access token returned"));
        }

        setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        onRefreshed(newAccessToken);
        isRefreshing = false;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        clearTokens();
        isRefreshing = false;
        onRefreshed(null);
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
