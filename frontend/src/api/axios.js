import axios from "axios";

function resolveApiBase() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined" && window.location?.origin) {
    // Same-origin production (Render single service)
    if (!window.location.hostname.includes("localhost")) {
      return `${window.location.origin}/api`;
    }
  }
  return "http://localhost:5000/api";
}

const API = axios.create({
  baseURL: resolveApiBase(),
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.includes("/login") && !path.includes("/forgot") && !path.includes("/reset")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
