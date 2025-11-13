export const BACKEND_CATEGORIES = [
    "EUROGAME",
    "AMERITRASH",
    "CONTROL_OF_TERRITORIES",
    "WARGAME",
    "ABSTRACT",
    "FILLER",
    "ROLE",
    "CLASSIC_BOARD",
    "BRAINTEASER",
    "FAMILY",
    "CARD",
    "COOPERATIVE",
    "COLLECTION_CARD"
];

const LABELS = {
    EUROGAME: "Евроигра",
    AMERITRASH: "Америтрэш",
    CONTROL_OF_TERRITORIES: "Контроль территорий",
    WARGAME: "Военная игра",
    ABSTRACT: "Абстрактная",
    FILLER: "Филлер",
    ROLE: "Ролевые",
    CLASSIC_BOARD: "Классическая настолка",
    BRAINTEASER: "Головоломка",
    FAMILY: "Семейная",
    CARD: "Карточная",
    COOPERATIVE: "Кооператив",
    COLLECTION_CARD: "Коллекционная карточная"
};

export function backendToLabel(value) {
    if (!value) return "";
    return LABELS[value] ?? value.replaceAll("_", " ").toLowerCase();
}

export function labelToBackend(label) {
    if (!label) return null;
    for (const k of Object.keys(LABELS)) {
        if (LABELS[k] === label) return k;
    }
    const idx = BACKEND_CATEGORIES.indexOf(label);
    if (idx >= 0) return BACKEND_CATEGORIES[idx];
    return null;
}

export function getAllBackendCategories() {
    return BACKEND_CATEGORIES.slice();
}
