import { apiClient } from "./axios";

export const fileApi = {
  getImageBlob: async (imageFileTitle) => {
    try {
      if (!imageFileTitle) throw new Error("imageFileTitle is required");
      const resp = await apiClient.get(`/api/files/image/${encodeURIComponent(imageFileTitle)}`, {
        responseType: "blob",
      });
      return resp.data;
    } catch (error) {
      console.error("Error get image blob:", error);
      throw error;
    }
  },

  getRulesBlob: async (rulesFileTitle) => {
    try {
      if (!rulesFileTitle) throw new Error("rulesFileTitle is required");
      const resp = await apiClient.get(`/api/files/rules/${encodeURIComponent(rulesFileTitle)}`, {
        responseType: "blob",
      });
      return resp.data;
    } catch (error) {
      console.error("Error get rules blob:", error);
      throw error;
    }
  }
};
