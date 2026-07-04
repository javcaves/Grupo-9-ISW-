// src/utils/apiResponse.js
export function extraerData(res) {
  if (res && typeof res === 'object' && 'data' in res) {
    return res.data;
  }
  return res;
}

// Mismo criterio que "extraerListado" que ya usan en UsuarioService:
// siempre devuelve un array, nunca undefined/null, para no romper .map().
export function extraerListado(res) {
  const data = extraerData(res);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

