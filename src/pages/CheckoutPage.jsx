import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CreditCard, Landmark, Smartphone, Check, Lock, ArrowLeft } from "lucide-react";
import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { CoverImage } from "../components/ProductCard";
import {
  formatAddress,
  formatCOP,
  formatDate,
  getErrorMessage,
  PAYMENT_LABELS,
  STATUS_LABELS,
} from "../utils/format";

const METHODS = [
  { value: "card", icon: CreditCard, hint: "Visa, Mastercard o Amex" },
  { value: "pse", icon: Landmark, hint: "Débito desde tu banco" },
  { value: "nequi", icon: Smartphone, hint: "Aprueba desde tu celular" },
];

// Tiempo de espera para que el pago simulado se sienta como uno real
const SIMULATED_DELAY_MS = 1800;

export default function CheckoutPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    orderService
      .getById(orderId)
      .then(setOrder)
      .catch((err) => setError(getErrorMessage(err, "No se encontró la orden.")))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
      const paid = await orderService.pay(order.id, method);
      setOrder(paid);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo completar el pago."));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="skeleton" style={{ height: 420 }} />;
  }

  if (!order) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
        <div>
          <Link to="/orders" className="btn btn-outline">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  if (order.status !== "pending") {
    const isPaid = order.payment_reference && order.status !== "cancelled";
    return (
      <div className="card-box processing" style={{ maxWidth: 560, margin: "0 auto" }}>
        {isPaid ? (
          <>
            <span className="success-burst">
              <Check size={42} strokeWidth={3} />
            </span>
            <h1 style={{ fontSize: "var(--text-2xl)" }}>¡Pago aprobado!</h1>
            <p className="muted">
              Tu pedido #{order.id} ya está confirmado. Te avisaremos cuando salga a envío.
            </p>
            <div className="receipt">
              <div>
                <span>Referencia</span>
                <strong className="mono">{order.payment_reference}</strong>
              </div>
              <div>
                <span>Método</span>
                <span>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
              </div>
              <div>
                <span>Fecha</span>
                <span>{formatDate(order.paid_at)}</span>
              </div>
              <div>
                <span>Total pagado</span>
                <strong>{formatCOP(order.total_amount)}</strong>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "var(--text-2xl)" }}>Pedido #{order.id}</h1>
            <p className="muted">Estado: {STATUS_LABELS[order.status] || order.status}</p>
          </>
        )}
        <div className="hero-actions" style={{ justifyContent: "center", marginTop: 0 }}>
          <Link to="/orders" className="btn btn-primary">
            Ver mis pedidos
          </Link>
          <Link to="/" className="btn btn-outline">
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Paso 2 de 2</span>
          <h1>Pago del pedido #{order.id}</h1>
          <p>
            Elige cómo quieres pagar. Es una simulación: no se cobra dinero real. Tienes 30
            minutos para pagar; después el pedido se cancela y los tomos vuelven al inventario.
          </p>
        </div>
        <Link to="/orders" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
          <span>Pagar después</span>
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="cart-layout">
        <form className="card-box" onSubmit={handlePay}>
          {processing ? (
            <div className="processing">
              <span className="spinner" />
              <h2>Procesando tu pago...</h2>
              <p className="muted">Conectando con {PAYMENT_LABELS[method]}</p>
            </div>
          ) : (
            <>
              <h2>Método de pago</h2>
              <div className="payment-options" role="radiogroup">
                {METHODS.map(({ value, icon: Icon, hint }) => (
                  <label
                    key={value}
                    className={`payment-option ${method === value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={value}
                      checked={method === value}
                      onChange={() => setMethod(value)}
                    />
                    <span className="pay-icon">
                      <Icon size={20} />
                    </span>
                    <span>
                      <strong>{PAYMENT_LABELS[value]}</strong>
                      <small>{hint}</small>
                    </span>
                  </label>
                ))}
              </div>

              {method === "card" && (
                <div style={{ marginTop: "1.5rem" }}>
                  {/* Tarjeta de demostración: no se pide ni se envía ningún dato de tarjeta */}
                  <div className="sim-card">
                    <span className="chip" />
                    <span className="number">•••• •••• •••• 4242</span>
                    <div className="row">
                      <span>{user?.full_name || "Cliente"}</span>
                      <span>12/30</span>
                    </div>
                  </div>
                  <p className="form-hint" style={{ marginTop: "0.75rem" }}>
                    Tarjeta de demostración. No escribas datos reales de ninguna tarjeta.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                style={{ marginTop: "1.5rem" }}
              >
                <Lock size={16} />
                <span>Pagar {formatCOP(order.total_amount)}</span>
              </button>
            </>
          )}
        </form>

        <aside className="card-box summary">
          <h2>Tu pedido</h2>
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">
                <span className="product-cover-wrapper thumb thumb-sm">
                  {item.product && <CoverImage product={item.product} />}
                </span>
                <span>
                  {item.product ? `${item.product.title} #${item.product.volume_number}` : `Producto #${item.product_id}`}
                  <span className="product-meta" style={{ display: "block" }}>
                    {item.quantity} × {formatCOP(item.unit_price)}
                  </span>
                </span>
                <strong>{formatCOP(Number(item.unit_price) * item.quantity)}</strong>
              </div>
            ))}
          </div>
          {order.shipping_address && (
            <div className="summary-line">
              <span style={{ whiteSpace: "nowrap" }}>Envío a</span>
              <span style={{ textAlign: "right" }}>
                {order.recipient_name && (
                  <>
                    {order.recipient_name}
                    <br />
                  </>
                )}
                {formatAddress(order)}
                {order.recipient_phone && (
                  <>
                    <br />
                    Tel. {order.recipient_phone}
                  </>
                )}
              </span>
            </div>
          )}
          <div className="summary-total">
            <span>Total</span>
            <span>{formatCOP(order.total_amount)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
