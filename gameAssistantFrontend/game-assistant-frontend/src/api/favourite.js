import { apiClient } from "./axios";

export const favouriteApi = {
  getAll: async () => {
    const resp = await apiClient.get("/api/favourites");
    return resp.data;
  },

  add: async (gameId) => {
    const resp = await apiClient.post(`/api/favourites/${gameId}/add`);
    return resp.data;
  },

  remove: async (gameId) => {
    const resp = await apiClient.delete(`/api/favourites/${gameId}/remove`);
    return resp.data;
  },
};
