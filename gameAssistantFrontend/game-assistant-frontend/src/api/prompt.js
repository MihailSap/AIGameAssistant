import { apiClient } from "./axios";

export const promptApi = {
    get: async () => {
        try {
            const resp = await apiClient.get("/api/system/prompt");
            return resp.data;
        } catch (error) {
            console.error("Error get prompt:", error);
            throw error;
        }
    },

    update: async (prompt) => {
        try {
            const resp = await apiClient.patch("/api/system/prompt", {prompt});
            return resp.data;
        } catch (error) {
            console.error("Error update prompt:", error);
            throw error;
        }
    },
};
