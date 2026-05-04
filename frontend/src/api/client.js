import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: API_BASE
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("wk_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default client;
