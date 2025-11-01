import { apiClient } from "./axios";

export const promptApi = {
    get: async () => {
        try {
            const resp = await apiClient.get("/api/prompt");
            return resp.data;
        } catch (error) {
            console.error("Error get prompt:", error);
            throw error;
        }
    },

    create: async (dto) => {
        try {
            const resp = await apiClient.post("/api/prompt", dto);
            return resp.data;
        } catch (error) {
            console.error("Error create prompt:", error);
            throw error;
        }
    },

    update: async (dto) => {
        try {
            const resp = await apiClient.put("/api/prompt", dto);
            return resp.data;
        } catch (error) {
            console.error("Error update prompt:", error);
            throw error;
        }
    },

    delete: async () => {
        try {
            const resp = await apiClient.delete("/api/prompt");
            return resp.data;
        } catch (error) {
            console.error("Error delete prompt:", error);
            throw error;
        }
    },
};
