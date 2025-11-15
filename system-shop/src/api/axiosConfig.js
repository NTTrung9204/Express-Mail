import axios from 'axios';

export const djangoAPI = axios.create({
  baseURL: import.meta.env.VITE_DJANGO_API_URL + '/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

djangoAPI.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

djangoAPI.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default djangoAPI;
