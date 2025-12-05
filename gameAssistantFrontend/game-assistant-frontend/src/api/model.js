import { apiClient } from "./axios";

export const modelApi = {
    updateUser: async (id, model) => {
        try {
            console.log(id, model);
            const resp = await apiClient.patch(`/api/users/${encodeURIComponent(id)}/model`, null, { params: { model } });
            return resp.data;
        } catch (error) {
            console.error("Error update user model:", error);
            throw error;
        }
    },

    getMain: async () => {
        try {
            const resp = await apiClient.get("/api/system/model");
            return resp.data;
        } catch (error) {
            console.error("Error get model:", error);
            throw error;
        }
    },

    updateMain: async (model) => {
        try {
            const resp = await apiClient.patch("/api/system/model", {model});
            return resp.data;
        } catch (error) {
            console.error("Error update model:", error);
            throw error;
        }
    },

    getAll: async () => {
        try {
            const resp = await apiClient.get("/api/chat/models");
            return resp.data;
        } catch (error) {
            console.error("Error get models:", error);
            throw error;
        }
    },
};