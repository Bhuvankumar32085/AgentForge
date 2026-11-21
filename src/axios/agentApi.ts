import axios from "axios";

export const agentApi = axios.create({
    baseURL: `${import.meta.env.VITE_NODE_BACKEND_URL || "http://localhost:8001"}/api/agents`,
    withCredentials: true,
});

