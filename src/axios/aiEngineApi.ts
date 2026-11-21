import axios from "axios";

export const aiEngineApi = axios.create({
  baseURL: `${import.meta.env.VITE_AI_ENGINE_URL || "http://localhost:8000"}/api`,
  withCredentials: true,
  timeout: 30000,
});


