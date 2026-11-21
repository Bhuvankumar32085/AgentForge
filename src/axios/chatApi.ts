import axios from "axios";

export const chatApi = axios.create({
  baseURL: `${import.meta.env.VITE_NODE_BACKEND_URL || "http://localhost:8001"}/api/chat`,
  withCredentials: true,
  timeout: 30000,
});

