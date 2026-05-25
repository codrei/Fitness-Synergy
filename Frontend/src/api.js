import { API_BASE } from "./config";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("fitness_synergy_token");
  const { headers: extraHeaders, ...restOptions } = options;
  return fetch(`${API_BASE}/${endpoint}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
  });
}
