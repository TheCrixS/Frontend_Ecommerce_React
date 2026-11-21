import api from "./api";

export const productService = {
  getAll: async ({ skip = 0, limit = 20, comicType = "", search = "" } = {}) => {
    const params = { skip, limit };
    if (comicType) params.comic_type = comicType;
    if (search) params.search = search;

    const { data } = await api.get("/products/", { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
  create: async (productData) => {
    const { data } = await api.post("/products/", productData);
    return data;
  },
  update: async (id, productData) => {
    const { data } = await api.patch(`/products/${id}`, productData);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};