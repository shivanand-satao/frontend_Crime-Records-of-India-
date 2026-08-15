import api from "./api";

const authService = {
  loginUser(credentials) {
    return api.post("/auth/login-user", credentials, { _skipAuthRefresh: true });
  },

  loginAdmin(credentials) {
    return api.post("/auth/login-admin", credentials, { _skipAuthRefresh: true });
  },

  register(payload) {
    return api.post("/auth/register", payload);
  },
};

export default authService;
