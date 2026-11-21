import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package } from "lucide-react";
import { orderService } from "../services/orderService";

const STATUS_LABELS = {
  pending: "Pendiente",
  paid: "Pagada",
  shipped: "Enviada",
  cancelled: "Cancelada",
};

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const successMessage = location.state?.orderSuccess || "";

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "No se pudo cargar tu historial de órdenes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <section>
      <h1 style={{ marginBottom: "1.25rem" }}>Mis Órdenes</h1>

      {successMessage && <div className="alert-success">{successMessage}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          Cargando órdenes...
        </p>
      ) : orders.length === 0 ? (
        <div className="card-box" style={{ textAlign: "center", padding: "3rem" }}>
          <Package size={40} color="var(--muted)" style={{ marginBottom: "0.75rem" }} />
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
            Aún no has realizado ninguna compra.
          </p>
          <Link to="/" className="btn btn-primary">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.map((order) => (
            <article key={order.id} className="card-box">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid var(--border)",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <strong style={{ fontSize: "1.05rem" }}>Orden #{order.id}</strong>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                    }}
                  >
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className={`status-badge ${order.status}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <strong style={{ fontSize: "1.1rem" }}>
                    ${Number(order.total_amount).toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link
                            to={`/products/${item.product_id}`}
                            style={{ color: "var(--primary)", fontWeight: 600 }}
                          >
                            Ver producto #{item.product_id}
                          </Link>
                        </td>
                        <td>{item.quantity}</td>
                        <td>${Number(item.unit_price).toFixed(2)}</td>
                        <td>
                          ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}