import { apiClient, BASE_URL } from "./axios";
import { escapeText } from "../utils/utils";
import { getAccessToken } from "../utils/storage";

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

  streamAnswer: (chatId, { onChunk, onComplete, onError } = {}) => {
    const controller = new AbortController();
    const token = getAccessToken();
    const url = `${BASE_URL.replace(/\/$/, "")}/api/chat/${chatId}/answer`;
    fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error(`stream response not ok: ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        const processEvent = (raw) => {
          const lines = raw.split(/\r?\n/);
          const dataLines = [];
          for (let line of lines) {
            if (line.startsWith("data:")) {
              dataLines.push(line.slice(5));
            }
          }
          const data = dataLines.join("\n").trim();
          if (data) {
            try {
              onChunk && onChunk(data);
            } catch (err) {
              console.error("onChunk handler error:", err);
            }
          }
        };

        const pump = () =>
          reader.read().then(({ done, value }) => {
            if (done) {
              if (buffer.trim()) {
                processEvent(buffer);
              }
              onComplete && onComplete();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            for (let i = 0; i < parts.length - 1; i++) {
              processEvent(parts[i]);
            }
            buffer = parts[parts.length - 1];
            return pump();
          });

        return pump();
      })
      .catch((err) => {
        if (err && err.name === "AbortError") return;
        onError && onError(err);
      });

    return {
      close: () => controller.abort(),
    };
  },
};
