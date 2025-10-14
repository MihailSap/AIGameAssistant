import { apiClient } from "./axios";

const baseUrl = (apiClient?.defaults && apiClient.defaults.baseURL)
  ? apiClient.defaults.baseURL.replace(/\/$/, "")
  : "";

export const fileApi = {
  async getImageBlob(imageFileTitle) {
    if (!imageFileTitle) throw new Error("imageFileTitle is required");
    const resp = await apiClient.get(`/api/file/image/${encodeURIComponent(imageFileTitle)}`, {
      responseType: "blob",
    });
    return resp.data;
  },

  async getRulesBlob(rulesFileTitle) {
    if (!rulesFileTitle) throw new Error("rulesFileTitle is required");
    const resp = await apiClient.get(`/api/file/rules/${encodeURIComponent(rulesFileTitle)}`, {
      responseType: "blob",
    });
    return resp.data;
  },

  getImageUrl(imageFileTitle) {
    if (!imageFileTitle) return null;
    return baseUrl ? `${baseUrl}/api/file/image/${encodeURIComponent(imageFileTitle)}` : `/api/file/image/${encodeURIComponent(imageFileTitle)}`;
  },

  getRulesUrl(rulesFileTitle) {
    if (!rulesFileTitle) return null;
    return baseUrl ? `${baseUrl}/api/file/rules/${encodeURIComponent(rulesFileTitle)}` : `/api/file/rules/${encodeURIComponent(rulesFileTitle)}`;
  }
};
