import { apiClient } from "./axios";

export const userApi = {
  async getById(id) {
    const resp = await apiClient.get(`/api/users/${encodeURIComponent(id)}`);
    return resp.data;
  },

  async updatePassword(id, updatePassword) {
    await apiClient.patch(`/api/users/${encodeURIComponent(id)}/update/password`, updatePassword);
  },

  async getAuthenticated() {
    const resp = await apiClient.get("/api/users/authenticated");
    return resp.data;
  },

  async getAll() {
    const resp = await apiClient.get("/api/users");
    return resp.data;
  },

  async delete(id) {
    await apiClient.delete(`/api/users/${encodeURIComponent(id)}`);
  },
};
