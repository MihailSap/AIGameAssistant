import { apiClient } from "./axios";

export const categoryApi = {
    getAll: async () => {
        try {
            const resp = await apiClient.get("/api/categories");
            return resp.data;
        } catch (error) {
            console.error("Error get categories:", error);
            throw error;
        }
    },

    get: async (id) => {
        try {
            const resp = await apiClient.get(`/api/categories/${encodeURIComponent(id)}`);
            return resp.data;
        } catch (error) {
            console.error("Error get category:", error);
            throw error;
        }
    },

    create: async (name) => {
        try {
            const resp = await apiClient.post("/api/categories", {name});
            return resp.data;
        } catch (error) {
            console.error("Error create category:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const resp = await apiClient.delete(`/api/categories/${encodeURIComponent(id)}`);
            return resp.data;
        } catch (error) {
            console.error("Error delete category:", error);
            throw error;
        }
    },
};