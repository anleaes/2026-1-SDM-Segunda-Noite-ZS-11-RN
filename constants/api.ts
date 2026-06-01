export const API_BASE_URL = 'http://localhost:8000';

export const buildUrl = (endpoint: string, id?: number | string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = `${API_BASE_URL}${cleanEndpoint}`;
  return id ? `${base}${id}/` : base;
};
