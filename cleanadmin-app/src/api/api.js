// src/api/api.js

const BASE_URL = "http://localhost:3000/api";

/**
 * Construye una URL con parámetros de consulta.
 */
function buildUrl(endpoint, params = {}) {

  const url = new URL(`${BASE_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.append(key, value);
    }

  });

  return url.toString();

}

/**
 * Método genérico para realizar peticiones HTTP.
 */
async function request(endpoint, options = {}, queryParams = {}) {

  const response = await fetch(
    buildUrl(endpoint, queryParams),
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }
  );

  // Respuesta vacía
  if (response.status === 204) {
    return null;
  }

  let data;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const motivoReal = data?.errorDetails || data?.details || data?.error || data?.data || "";
    const detalleError = motivoReal ? `\n\nMotivo: ${typeof motivoReal === 'string' ? motivoReal : JSON.stringify(motivoReal)}` : '';

    throw new Error(
      (data?.message || "Error en la petición.") + detalleError
    );
  }

  return data;
}

export const api = {

  /**
   * GET
   */
  get(endpoint, params = {}) {

    return request(
      endpoint,
      {
        method: "GET",
      },
      params
    );

  },

  /**
   * POST
   */
  post(endpoint, body = {}) {

    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

  },

  /**
   * PUT
   */
  put(endpoint, body = {}) {

    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });

  },

  /**
   * PATCH
   */
  patch(endpoint, body = {}) {

    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

  },

  /**
   * DELETE
   */
  delete(endpoint) {

    return request(endpoint, {
      method: "DELETE",
    });

  },

};