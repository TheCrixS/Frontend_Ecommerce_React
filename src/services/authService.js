import api from "./api";

export const authService = {
  register: async (userData) => {
    const { data } = await api.post("/users/register", userData);
    return data;
  },
  login: async (credentials) => {
    const { data } = await api.post("/users/login", credentials);
    return data; // { access_token, token_type, user }
  },
  getProfile: async () => {
    const { data } = await api.get("/users/me");
    return data;
  },
};