const MODEL_MAP = {
  YANDEX_GPT: "Yandex-GPT",
  OPENAI: "Сhat-GPT",
  MISTRAL: "Mistral",
};

export function backendToFrontendModel(model) {
  if (!model && model !== "") return null;
  if (MODEL_MAP[model]) return MODEL_MAP[model];
  return model;
}