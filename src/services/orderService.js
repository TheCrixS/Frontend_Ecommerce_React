import api from "./api";

export const orderService = {
  create: async (items, shippingAddress) => {
    // Formato esperado por OrderCreate: { items: [{ product_id, quantity }], shipping_address }
    const payload = {
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      shipping_address: shippingAddress || null,
    };
    const { data } = await api.post("/orders/", payload);
    return data;
  },
  getMyOrders: async () => {
    const { data } = await api.get("/orders/me");
    return data;
  },
  getById: async (orderId) => {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },
  pay: async (orderId, paymentMethod) => {
    const { data } = await api.post(`/orders/${orderId}/pay`, {
      payment_method: paymentMethod,
    });
    return data;
  },
  cancel: async (orderId) => {
    const { data } = await api.post(`/orders/${orderId}/cancel`);
    return data;
  },
  getAll: async () => {
    const { data } = await api.get("/orders/");
    return data;
  },
  updateStatus: async (orderId, status) => {
    const { data } = await api.patch(`/orders/${orderId}/status`, { status });
    return data;
  },
};
