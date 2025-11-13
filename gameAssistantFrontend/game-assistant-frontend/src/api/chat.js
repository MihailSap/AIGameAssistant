import { apiClient } from "./axios";
import { escapeText } from "../utils/utils";

export const chatApi = {
  getChat: async (id) => {
    try {
      const resp = await apiClient.get(`/api/chat/${id}`);
      return resp?.data;
    } catch (error) {
      console.error("Error get chat:", error);
      throw error;
    }
  },

  startChat: async ({ gameId, request }) => {
    try {
      const payload = { gameId: gameId == null ? null : Number(gameId), request: escapeText(request ?? "") };
      const resp = await apiClient.post("/api/chat/start", payload);
      return resp?.data;
    } catch (error) {
      console.error("Error starting chat:", error);
      throw error;
    }
  },

  continueChat: async (id, prompt) => {
    try {
      const payload = typeof prompt === "string" ? { request: escapeText(prompt) } : prompt;
      const resp = await apiClient.put(`/api/chat/${id}`, payload);
      return resp?.data;
    } catch (error) {
      console.error("Error continuing chat:", error);
      throw error;
    }
  },

  deleteChat: async (id) => {
    try {
      const resp = await apiClient.delete(`/api/chat/${id}`);
      return resp?.data;
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  },

  getMarkdownParsed: async (id) => {
    try {
      const resp = await apiClient.get(`/api/chat/md/${id}`);
      return resp?.data;
    } catch (error) {
      console.error("Error get markdown rules:", error);
      throw error;
    }
  },

  getChatPreviewsByGame: async (gameId) => {
    try {
      const resp = await apiClient.get(`/api/chat/by-game/${gameId}`);
      return resp?.data;
    } catch (error) {
      console.error("Error get chat previews by game:", error);
      throw error;
    }
  },

  getChatPreviewsByUser: async () => {
    try {
      const resp = await apiClient.get(`/api/chat/by-user`);
      return resp?.data;
    } catch (error) {
      console.error("Error get chat previews by user:", error);
      throw error;
    }
  },
};
