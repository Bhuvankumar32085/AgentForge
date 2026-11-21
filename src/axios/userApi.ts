import axios from "axios";

export const userApi = axios.create({
    baseURL: `${import.meta.env.VITE_NODE_BACKEND_URL}/api/users`,
    withCredentials: true,
});
