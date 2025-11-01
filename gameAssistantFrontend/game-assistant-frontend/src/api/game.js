import { apiClient } from "./axios";

function buildFormData(gameDTO) {
  const fd = new FormData();
  fd.append("title", gameDTO.title);
  fd.append("description", gameDTO.description);
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
      const resp = await apiClient.post("/api/game/create", fd);
      return resp.data;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  },

  read: async (id) => {
    try {
      const resp = await apiClient.get(`/api/game/${encodeURIComponent(id)}`);
      return resp.data;
    } catch (error) {
      console.error("Error reading game:", error);
      throw error;
    }
  },

  update: async (id, gameDTO) => {
    try {
      const fd = buildFormData(gameDTO);
      const resp = await apiClient.put(`/api/game/${encodeURIComponent(id)}/update`, fd);
      return resp.data;
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/api/game/${encodeURIComponent(id)}/delete`);
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const resp = await apiClient.get("/api/game/all");
      return resp.data;
    } catch (error) {
      console.error("Error get all games:", error);
      throw error;
    }
  },
};
