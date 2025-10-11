export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken === null) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } else if (accessToken !== undefined) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } else if (refreshToken !== undefined) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
