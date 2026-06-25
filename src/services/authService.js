import api from "./api";

const authService = {
  loginUser(credentials) {
    return api.post("/auth/login", credentials);
  },

  loginAdmin(credentials) {
    return api.post("/auth/login-admin", credentials);
  },

  register(payload) {
    return api.post("/auth/register", payload);
  },
};

export default authService;
