// Philippine mobile phone helpers.
// All registration flows require 11 digits starting with "09".

export const PHONE_PATTERN_STR = "09[0-9]{9}";
export const PHONE_PATTERN = new RegExp(`^${PHONE_PATTERN_STR}$`);

// Strip everything that isn't a digit and cap at 11 chars.
// Used on every keystroke so letters/symbols can never enter state.
export function sanitizePhoneInput(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 11);
}

export function isValidPhilippinePhone(value) {
  return PHONE_PATTERN.test(value || "");
}
