// En producción VITE_API_URL es relativa (/api/v1) y la API vive en el mismo dominio
const API_ORIGIN = new URL(
  import.meta.env.VITE_API_URL || "http://localhost:8000",
  window.location.origin
).origin;

// Pesos colombianos sin decimales: $ 45.000
const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCOP(value) {
  // Number() porque Pydantic serializa Decimal como string
  return copFormatter.format(Number(value) || 0);
}

// Las portadas subidas se guardan como rutas relativas (/uploads/...) del backend
export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `${API_ORIGIN}${url}`;
  return url;
}

export function formatDate(value) {
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getErrorMessage(err, fallback) {
  // FastAPI devuelve una lista de errores cuando falla la validación (422)
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(". ");
  return detail || fallback;
}

// Debe coincidir con MAX_UNITS_PER_TITLE del backend
export const MAX_UNITS_PER_TITLE = 5;

// Unidades de un tomo que caben en un pedido: el stock, con un tope por cliente
export function maxUnits(product) {
  return Math.max(0, Math.min(product.stock, MAX_UNITS_PER_TITLE));
}

export const TYPE_LABELS = {
  manga: "Manga",
  comic: "Cómic",
  manhwa: "Manhwa",
  manhua: "Manhua",
};

export const STATUS_LABELS = {
  pending: "Pendiente de pago",
  paid: "Pagada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

export const ORDER_FLOW = ["pending", "paid", "shipped", "delivered"];

export const PAYMENT_LABELS = {
  card: "Tarjeta de crédito o débito",
  pse: "PSE",
  nequi: "Nequi",
};
