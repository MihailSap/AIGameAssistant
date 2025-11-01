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
  getById: async (id) => {
    try {
      const resp = await apiClient.get(`/api/users/${encodeURIComponent(id)}`);
      return resp.data;
    } catch (error) {
      console.error("Error getting user by id:", error);
      throw error;
    }
  },

  updatePassword: async (id, updatePassword) => {
    try {
      await apiClient.patch(`/api/users/${encodeURIComponent(id)}/update/password`, updatePassword);
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  },

  getAuthenticated: async () => {
    try {
      const resp = await apiClient.get("/api/users/authenticated");
      return resp.data;
    } catch (error) {
      console.error("Error getting authenticated user:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const resp = await apiClient.get("/api/users");
      return resp.data;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/api/users/${encodeURIComponent(id)}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  makeAdmin: async (id) => {
    try {
      await apiClient.patch(`/api/users/${encodeURIComponent(id)}/make-admin`);
    } catch (error) {
      console.error("Error making user admin:", error);
      throw error;
    }
  },

  makeNotAdmin: async (id) => {
    try {
      await apiClient.patch(`/api/users/${encodeURIComponent(id)}/make-not-admin`);
    } catch (error) {
      console.error("Error removing user admin:", error);
      throw error;
    }
  },

  updateImage: async (id, userRequestDTO) => {
    try {
      const fd = buildFormData(userRequestDTO);
      const resp = await apiClient.patch(`/api/users/${encodeURIComponent(id)}/update/image`, fd);
      return resp.data;
    } catch (error) {
      console.error("Error updating user image:", error);
      throw error;
    }
  },
};
