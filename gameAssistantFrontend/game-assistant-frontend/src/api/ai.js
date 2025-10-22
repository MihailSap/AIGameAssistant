import { apiClient } from "./axios";
import { escapeText } from "../utils/utils";

const STORAGE_PREFIX = "game_ai_sessions_v1";

function storageKeyForGame(gameId) {
  return `${STORAGE_PREFIX}::game::${String(gameId)}`;
}

function messagesKey(gameId, sessionId) {
  return `${storageKeyForGame(gameId)}::msgs::${String(sessionId)}`;
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("ai: readJson failed", key, e);
    return null;
  }
}

function writeJson(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    console.warn("ai: writeJson failed", key, e);
  }
}

function ensureArray(val) {
  return Array.isArray(val) ? val : [];
}

function makeId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const aiApi = {
  ask: async (prompt) => {
    const resp = await apiClient.post("/api/ai/ask", escapeText(prompt), {
      headers: { "Content-Type": "text/plain" },
    });
    return resp?.data.result.alternatives[0]?.message.text;;
  },

  createSession: async (gameId, title = "Новая сессия") => {
    const key = storageKeyForGame(gameId);
    const sessions = ensureArray(readJson(key));
    const id = makeId("s");
    const session = {
      id,
      title,
      createdAt: new Date().toISOString(),
      gameId: String(gameId),
    };
    sessions.unshift(session);
    writeJson(key, sessions);
    writeJson(messagesKey(gameId, id), []);
    return session;
  },

  getSessions: async (gameId) => {
    const key = storageKeyForGame(gameId);
    const sessions = ensureArray(readJson(key));
    return sessions.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAllSessions: async () => {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        if (!key.startsWith(`${STORAGE_PREFIX}::game::`)) continue;

        if (key.includes("::msgs::")) continue;

        const parts = key.split("::");
        const maybeGameId = parts[parts.length - 1];
        const parsed = readJson(key);
        if (!Array.isArray(parsed)) continue;

        parsed.forEach(s => {
          if (s && typeof s === "object" && !("role" in s)) {
            out.push({
              ...s,
              gameId: String(maybeGameId),
            });
          }
        });
      }
    } catch (e) {
      console.warn("ai: getAllSessions failed", e);
    }
    out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return out;
  },

  deleteSession: async (gameId, sessionId) => {
    try {
      const key = storageKeyForGame(gameId);
      const sessions = ensureArray(readJson(key));
      const next = sessions.filter(s => String(s.id) !== String(sessionId));
      writeJson(key, next);
      localStorage.removeItem(messagesKey(gameId, sessionId));
      return true;
    } catch (e) {
      console.error("ai.deleteSession failed", e);
      throw e;
    }
  },

  getMessages: async (gameId, sessionId) => {
    const key = messagesKey(gameId, sessionId);
    const msgs = ensureArray(readJson(key));
    return msgs.slice();
  },

  sendMessage: async (gameId, sessionId, text) => {
    if (!text || !String(text).trim()) {
      throw new Error("empty message");
    }

    const userMsg = {
      id: makeId("m_user"),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    const placeholderBot = {
      id: makeId("m_bot_tmp"),
      role: "bot",
      text: "Думаю...",
      createdAt: new Date().toISOString(),
    };

    const msgsKey = messagesKey(gameId, sessionId);
    const msgs = ensureArray(readJson(msgsKey));

    msgs.push(userMsg);
    msgs.push(placeholderBot);
    writeJson(msgsKey, msgs);

    try {
      const answer = await aiApi.ask(text);
      const botMsg = {
        id: makeId("m_bot"),
        role: "bot",
        text: typeof answer === "string" ? answer : String(answer),
        createdAt: new Date().toISOString(),
      };

      const current = ensureArray(readJson(msgsKey));
      let idx = -1;
      for (let i = current.length - 1; i >= 0; i--) {
        if (current[i] && current[i].id === placeholderBot.id) {
          idx = i;
          break;
        }
      }
      if (idx >= 0) {
        current.splice(idx, 1, botMsg);
      } else {
        current.push(botMsg);
      }
      writeJson(msgsKey, current);
      return { userMessage: userMsg, botMessage: botMsg };
    } catch (err) {
      console.error("ai.sendMessage: ask failed", err);
      const current = ensureArray(readJson(msgsKey));
      let idx = -1;
      for (let i = current.length - 1; i >= 0; i--) {
        if (current[i] && current[i].id === placeholderBot.id) {
          idx = i;
          break;
        }
      }
      const errMsg = {
        id: makeId("m_bot_err"),
        role: "bot",
        text: "Ошибка при получении ответа от сервера.",
        createdAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        current.splice(idx, 1, errMsg);
      } else {
        current.push(errMsg);
      }
      writeJson(msgsKey, current);
      throw err;
    }
  },
};
