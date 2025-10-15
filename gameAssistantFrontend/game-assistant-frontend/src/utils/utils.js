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

  return text.replace(/[&<>"'\/\\`]/g, (char) => escapeMap[char]);
};