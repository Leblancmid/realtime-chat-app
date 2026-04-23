import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost",
    withCredentials: true, // 🔥 REQUIRED
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});