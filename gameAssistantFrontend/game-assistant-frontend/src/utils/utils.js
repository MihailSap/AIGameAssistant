export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email)) {
    return { isValid: false, message: 'Некорректный email' };
  }
  return { isValid: true };
};