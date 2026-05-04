import axios from "axios";

export const API_BASE = "http://wktime-backend-alb-915096209.eu-north-1.elb.amazonaws.com/api";

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
