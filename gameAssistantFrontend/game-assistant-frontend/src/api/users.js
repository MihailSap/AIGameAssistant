import { apiClient } from "./axios";

function buildFormData(userRequestDTO) {
  const fd = new FormData();
  fd.append("email", userRequestDTO.email);
  fd.append("login", userRequestDTO.login);
  fd.append("password", userRequestDTO.password);
  fd.append("isAdmin", userRequestDTO.isAdmin);
  if (userRequestDTO.imageFile) fd.append("imageFile", userRequestDTO.imageFile);
  return fd;
}

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

  async makeAdmin(id) {
    await apiClient.patch(`/api/users/${encodeURIComponent(id)}/make-admin`);
  },

  async makeNotAdmin(id) {
    await apiClient.patch(`/api/users/${encodeURIComponent(id)}/make-not-admin`);
  },

  async updateImage(id, userRequestDTO) {
    console.log(userRequestDTO);
    const fd = buildFormData(userRequestDTO);
    const resp = await apiClient.patch(`/api/users/${encodeURIComponent(id)}/update/image`, fd);
    return resp.data;
  },
};
