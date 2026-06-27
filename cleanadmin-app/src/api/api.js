// src/api/api.js

const BASE_URL = "http://localhost:3000/api";

/**
 * Construye la URL con query params.
 */
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
}

/**
 * Método genérico para realizar peticiones HTTP.
 */
async function request(endpoint, options = {}, queryParams = {}) {
  const response = await fetch(buildUrl(endpoint, queryParams), {
    credentials: "include", // Envía la cookie JWT automáticamente
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Error en la petición.");
  }

  // DELETE normalmente no devuelve contenido
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {

  get(endpoint, params = {}) {
    return request(endpoint, { method: "GET" }, params);
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return request(endpoint, {
      method: "DELETE",
    });
  },

};