import api from "./api";

export const orderService = {
  create: async (items, shipping = {}) => {
    // Formato esperado por OrderCreate: { items: [{ product_id, quantity }], datos de envío }.
    // Si no se envía dirección, el backend usa la guardada en el perfil.
    const payload = {
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      recipient_name: shipping.recipient_name || null,
      recipient_phone: shipping.recipient_phone || null,
      shipping_address: shipping.shipping_address || null,
      shipping_city: shipping.shipping_city || null,
      shipping_department: shipping.shipping_department || null,
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
