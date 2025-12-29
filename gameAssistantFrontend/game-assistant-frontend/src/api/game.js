import { apiClient } from "./axios";

function buildFormData(gameDTO) {
  const fd = new FormData();
  fd.append("title", gameDTO.title);
  fd.append("description", gameDTO.description);
  fd.append("categories", gameDTO.categories);
  if (gameDTO.imageFile) {
    fd.append("imageFile", gameDTO.imageFile)
  } else {
    fd.append("imageFile", new Blob());
  }
  if (gameDTO.rulesFile) {
    fd.append("rulesFile", gameDTO.rulesFile);
  } else {
    fd.append("rulesFile", new Blob())
  }
  return fd;
}

export const gameApi = {
  create: async (gameDTO) => {
    try {
      const fd = buildFormData(gameDTO);
      const resp = await apiClient.post("/api/games", fd);
      return resp.data;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  },

  read: async (id) => {
    try {
      const resp = await apiClient.get(`/api/games/${encodeURIComponent(id)}`);
      return resp.data;
    } catch (error) {
      console.error("Error reading game:", error);
      throw error;
    }
  },

  update: async (id, gameDTO) => {
    try {
      const fd = buildFormData(gameDTO);
      const resp = await apiClient.patch(`/api/games/${encodeURIComponent(id)}`, fd);
      return resp.data;
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/api/games/${encodeURIComponent(id)}`);
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const resp = await apiClient.get("/api/games");
      return resp.data;
    } catch (error) {
      console.error("Error get all games:", error);
      throw error;
    }
  },

  getAllPaged: async (page, size, filter = null, category = null, sortBy="title") => {
    try {
      const params = {};

      if (page != null) params.page = page;
      if (size != null) params.size = size;
      if (filter != null) params.filter = filter;
      if (category != null) params.category = category;
      if (sortBy != null) params.sortBy = sortBy;

      const resp = await apiClient.get("/api/games/paged", { params });
      return resp.data;
    } catch (error) {
      console.error("Error get games:", error);
      throw error;
    }
  }
};
