import axios from "axios";

const api = axios.create({
    baseURL: "https://faceted-vacancy-agreeable.ngrok-free.dev/api",
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;