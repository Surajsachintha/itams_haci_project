import axios from 'axios';

const apiUrl = import.meta.env.VITE_BASE_API_URL;

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

export default api;
