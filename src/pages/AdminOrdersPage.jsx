import { useState, useEffect } from "react";
import { orderService } from "../services/orderService";
import AdminTabs from "../components/AdminTabs";
import { OrderItems, OrderTimeline } from "./OrdersPage";
import { formatCOP, formatDate, getErrorMessage, STATUS_LABELS } from "../utils/format";

// Debe coincidir con ALLOWED_TRANSITIONS del backend
const NEXT_STATUSES = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    orderService
      .getAll()
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err, "No se pudieron cargar los pedidos.")))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (order, status) => {
    if (status === "cancelled" && !window.confirm(`¿Cancelar el pedido #${order.id}?`)) return;
    setBusyId(order.id);
    setError("");
    try {
      const updated = await orderService.updateStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo actualizar el pedido."));
    } finally {
      setBusyId(null);
    }
  };

  const revenue = orders
    .filter((o) => ["paid", "shipped", "delivered"].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  const countBy = (status) => orders.filter((o) => o.status === status).length;
  const visible = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Administración</span>
          <h1>Pedidos</h1>
        </div>
        <AdminTabs />
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span>Ventas pagadas</span>
          <strong>{formatCOP(revenue)}</strong>
        </div>
        <div className="stat">
          <span>Por enviar</span>
          <strong>{countBy("paid")}</strong>
        </div>
        <div className="stat">
          <span>En camino</span>
          <strong>{countBy("shipped")}</strong>
        </div>
        <div className="stat">
          <span>Pendientes de pago</span>
          <strong>{countBy("pending")}</strong>
        </div>
      </div>

      <div className="filter-pills">
        {["", "pending", "paid", "shipped", "delivered", "cancelled"].map((status) => (
          <button
            key={status || "all"}
            type="button"
            className={`pill ${filter === status ? "active" : ""}`}
            onClick={() => setFilter(status)}
          >
            {status ? STATUS_LABELS[status] : "Todos"}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <h2>No hay pedidos en esta vista</h2>
        </div>
      ) : (
        visible.map((order) => (
          <article key={order.id} className="card-box order-card">
            <div className="order-head">
              <div>
                <h2>Pedido #{order.id}</h2>
                <span className="product-meta">
                  {order.user.full_name} · {order.user.email} · {formatDate(order.created_at)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className={`status-badge ${order.status}`}>
                  {STATUS_LABELS[order.status]}
                </span>
                <span className="order-total">{formatCOP(order.total_amount)}</span>
              </div>
            </div>

            <OrderTimeline status={order.status} />
            <OrderItems items={order.items} />

            <div className="order-foot">
              <span>
                {order.payment_reference ? `Ref. ${order.payment_reference}` : "Sin pago"}
                {order.shipping_address && ` · ${order.shipping_address}`}
              </span>
              <div className="order-foot-actions">
                {NEXT_STATUSES[order.status].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn-sm ${status === "cancelled" ? "btn-danger" : "btn-outline"}`}
                    disabled={busyId === order.id}
                    onClick={() => changeStatus(order, status)}
                  >
                    {status === "cancelled" ? "Cancelar" : `Marcar como ${STATUS_LABELS[status].toLowerCase()}`}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
