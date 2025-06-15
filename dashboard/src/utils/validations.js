// utils/validations.js

export const validatePhoneNumber = (phoneNumber) => {
  // A simple regex for phone numbers (adjust as needed for your specific requirements)
  // This example allows 10 to 15 digits, optionally starting with a plus sign for international numbers.
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phoneNumber);
};

export const validateEmail = (email) => {
  // A common regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
