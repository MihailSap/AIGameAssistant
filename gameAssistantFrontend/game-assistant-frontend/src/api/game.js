import { apiClient } from "./axios";

function buildFormData(gameDTO) {
  const fd = new FormData();
  if (gameDTO.title !== undefined && gameDTO.title !== null) fd.append("title", gameDTO.title);
  if (gameDTO.description !== undefined && gameDTO.description !== null) fd.append("description", gameDTO.description);
  if (gameDTO.imageFile) fd.append("imageFile", gameDTO.imageFile);
  if (gameDTO.rulesFile) fd.append("rulesFile", gameDTO.rulesFile);
  return fd;
}

export const gameApi = {
  async create(gameDTO) {
    const fd = buildFormData(gameDTO);
    const resp = await apiClient.post("/api/game/create", fd);
    return resp.data;
  },

  async read(id) {
    const resp = await apiClient.get(`/api/game/${encodeURIComponent(id)}`);
    return resp.data;
  },

  async update(id, gameDTO) {
    const fd = buildFormData(gameDTO);
    const resp = await apiClient.put(`/api/game/${encodeURIComponent(id)}/update`, fd);
    return resp.data;
  },

  async delete(id) {
    await apiClient.delete(`/api/game/${encodeURIComponent(id)}/delete`);
  },

  async getAll() {
    const resp = await apiClient.get("/api/game/all");
    return resp.data;
  },
};
