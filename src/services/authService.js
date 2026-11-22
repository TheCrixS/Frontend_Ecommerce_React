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
  updateProfile: async (profile) => {
    // Solo se envían los campos a cambiar; un texto vacío borra el dato
    const { data } = await api.put("/users/me", profile);
    return data;
  },
  changePassword: async (currentPassword, newPassword) => {
    await api.put("/users/me/password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};