export const BackendUri = import.meta.env.VITE_BACKEND_URI || '/api/admin';

export const appendQuery = (baseUrl: string, q: Record<string, any>) =>
  baseUrl + '?' + new URLSearchParams(q).toString();
