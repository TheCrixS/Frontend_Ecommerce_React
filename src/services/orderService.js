import api from "./api";

export const orderService = {
  create: async (items) => {
    // Formato esperado por OrderCreate: { items: [{ product_id, quantity }] }
    const payload = {
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    };
    const { data } = await api.post("/orders/", payload);
    return data;
  },
  getMyOrders: async () => {
    const { data } = await api.get("/orders/me");
    return data;
  },
  updateStatus: async (orderId, status) => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status });
    return data;
  },
};