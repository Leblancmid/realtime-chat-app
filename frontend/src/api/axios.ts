import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost",
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

// 🔥 ADD THIS (important)
api.interceptors.request.use((config) => {
    const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

    if (token) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
    }

    return config;
});