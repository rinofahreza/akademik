import axios from 'axios';

const api = axios.create({
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  config.baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('siswa_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('siswa_token');
      localStorage.removeItem('siswa_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
