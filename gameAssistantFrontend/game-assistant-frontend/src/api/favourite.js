import { apiClient } from "./axios";

export const favouriteApi = {
  getAllPaged: async (page, size, filter = null, category = null, sortBy="title") => {
    try {
      const params = {};

      if (page != null) params.page = page;
      if (size != null) params.size = size;
      if (filter != null) params.filter = filter;
      if (category != null) params.category = category;
      if (sortBy != null) params.sortBy = sortBy;

      const resp = await apiClient.get("/api/favourites/paged", { params });
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
