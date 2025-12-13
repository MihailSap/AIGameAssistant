import { apiClient } from "./axios";

export const favouriteApi = {
  getAll: async () => {
    try {
      const resp = await apiClient.get("/api/favourites");
      return resp.data;
    } catch (error) {
      console.error("Error get favourites:", error);
      throw error;
    }
  },

  add: async (gameId) => {
    try {
      const resp = await apiClient.post(`/api/favourites/${gameId}`);
      return resp.data;
    } catch (error) {
      console.error("Error add favourite:", error);
      throw error;
    }
  },

  remove: async (gameId) => {
    try {
      const resp = await apiClient.delete(`/api/favourites/${gameId}`);
      return resp.data;
    } catch (error) {
      console.error("Error remove favourite:", error);
      throw error;
    }
  },
};
