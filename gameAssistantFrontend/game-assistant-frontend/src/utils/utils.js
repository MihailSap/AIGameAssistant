export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email)) {
    return { isValid: false, message: 'Некорректный email' };
  }
  return { isValid: true };
};

export const escapeText = (text) => {
  if (typeof text !== 'string') {
    return text;
  }

  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '\\': '&#x5C;',
    '`': '&#x60;'
  };

  // eslint-disable-next-line no-useless-escape
  return text.replace(/[&<>"'\/\\`]/g, (char) => escapeMap[char]);
};

function pad(n) { return String(n).padStart(2, '0'); }

export function formatDate(value) {
  if (!value) return '-';
  const d = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '-';
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear() % 100;
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

