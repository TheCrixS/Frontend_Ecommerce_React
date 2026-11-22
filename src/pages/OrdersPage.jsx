import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, Check, CreditCard, X } from "lucide-react";
import { orderService } from "../services/orderService";
import { CoverImage } from "../components/ProductCard";
import {
  formatAddress,
  formatCOP,
  formatDate,
  getErrorMessage,
  ORDER_FLOW,
  PAYMENT_LABELS,
  STATUS_LABELS,
} from "../utils/format";

const STEP_LABELS = {
  pending: "Pedido creado",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
};

export function OrderTimeline({ status }) {
  if (status === "cancelled") return null;
  const currentIndex = ORDER_FLOW.indexOf(status);
  return (
    <ol className="timeline">
      {ORDER_FLOW.map((step, index) => (
        <li
          key={step}
          className={`${index <= currentIndex ? "done" : ""} ${
            index === currentIndex ? "current" : ""
          }`}
        >
          <span className="step-dot">{index <= currentIndex ? <Check size={16} /> : index + 1}</span>
          {STEP_LABELS[step]}
        </li>
      ))}
    </ol>
  );
}

export function OrderItems({ items }) {
  return (
    <div className="order-items">
      {items.map((item) => (
        <div key={item.id} className="order-item">
          <Link to={`/products/${item.product_id}`} className="product-cover-wrapper thumb thumb-sm">
            {item.product && <CoverImage product={item.product} />}
          </Link>
          <span>
            <Link to={`/products/${item.product_id}`}>
              {item.product
                ? `${item.product.title} #${item.product.volume_number}`
                : `Producto #${item.product_id}`}
            </Link>
            <span className="product-meta" style={{ display: "block" }}>
              {item.quantity} × {formatCOP(item.unit_price)}
            </span>
          </span>
          <strong>{formatCOP(Number(item.unit_price) * item.quantity)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const successMessage = location.state?.orderSuccess || "";

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(getErrorMessage(err, "No se pudo cargar tu historial de pedidos."));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancel = async (order) => {
    if (!window.confirm(`¿Cancelar el pedido #${order.id}? Los tomos vuelven al inventario.`)) {
      return;
    }
    setBusyId(order.id);
    setError("");
    try {
      const updated = await orderService.cancel(order.id);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cancelar el pedido."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Historial</span>
          <h1>Mis pedidos</h1>
          <p>Sigue el estado de tus compras desde el pago hasta la entrega.</p>
        </div>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="skeleton" style={{ height: 240 }} />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Package size={28} />
          </span>
          <h2>Aún no tienes pedidos</h2>
          <p>Cuando compres tu primer tomo aparecerá aquí.</p>
          <Link to="/" className="btn btn-primary">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <article key={order.id} className="card-box order-card">
            <div className="order-head">
              <div>
                <h2>Pedido #{order.id}</h2>
                <span className="product-meta">{formatDate(order.created_at)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className={`status-badge ${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
                <span className="order-total">{formatCOP(order.total_amount)}</span>
              </div>
            </div>

            <OrderTimeline status={order.status} />
            <OrderItems items={order.items} />

            <div className="order-foot">
              <span>
                {order.payment_reference
                  ? `${PAYMENT_LABELS[order.payment_method] || order.payment_method} · Ref. ${order.payment_reference}`
                  : order.status === "pending"
                  ? "Esperando el pago"
                  : "Sin pago registrado"}
                {order.shipping_address && ` · Envío a ${formatAddress(order)}`}
              </span>
              {order.status === "pending" && (
                <div className="order-foot-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busyId === order.id}
                    onClick={() => handleCancel(order)}
                  >
                    <X size={15} />
                    <span>Cancelar</span>
                  </button>
                  <Link to={`/checkout/${order.id}`} className="btn btn-primary btn-sm">
                    <CreditCard size={15} />
                    <span>Pagar ahora</span>
                  </Link>
                </div>
              )}
            </div>
          </article>
        ))
      )}
    </section>
  );
}
