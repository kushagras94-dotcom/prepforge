import axios from 'axios';

const api = axios.create({
  baseURL: 'https://studious-goggles-4j49g669rpjj2qj6q-5000.app.github.dev/api',
});

// Attach JWT token to every request automatically, if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
