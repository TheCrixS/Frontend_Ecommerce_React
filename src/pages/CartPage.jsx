import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await orderService.create(items);
      clearCart();
      navigate("/orders", {
        state: { orderSuccess: "¡Compra realizada con éxito!" },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "No se pudo procesar tu orden. Revisa el stock disponible."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card-box" style={{ textAlign: "center", padding: "3rem" }}>
        <ShoppingBag size={42} color="var(--muted)" style={{ marginBottom: "0.75rem" }} />
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
          Tu carrito está vacío
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.25rem" }}>
          Agrega mangas, cómics o manhwas desde el catálogo para iniciar una orden.
        </p>
        <Link to="/" className="btn btn-primary">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <section>
      <h1 style={{ marginBottom: "1.25rem" }}>Carrito de Compras ({totalItems})</h1>

      {error && <div className="alert-error">{error}</div>}

      <div className="cart-layout">
        <div className="card-box">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="cart-row">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                {product.cover_image_url ? (
                  <img
                    src={product.cover_image_url}
                    alt={product.title}
                    style={{
                      width: "56px",
                      height: "76px",
                      objectFit: "cover",
                      borderRadius: "0.35rem",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "56px",
                      height: "76px",
                      background: "#e2e8f0",
                      borderRadius: "0.35rem",
                    }}
                  />
                )}

                <div>
                  <Link
                    to={`/products/${product.id}`}
                    style={{ fontWeight: 700, display: "block" }}
                  >
                    {product.title} #{product.volume_number}
                  </Link>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    ${Number(product.price).toFixed(2)} c/u &middot; Stock máx:{" "}
                    {product.stock}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div className="qty-control">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock}
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <strong style={{ minWidth: "75px", textAlign: "right" }}>
                  ${(Number(product.price) * quantity).toFixed(2)}
                </strong>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => removeFromCart(product.id)}
                  title="Eliminar tomo"
                >
                  <Trash2 size={16} color="var(--danger)" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="card-box">
          <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
            Resumen del pedido
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              color: "var(--muted)",
            }}
          >
            <span>Artículos ({totalItems})</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "0.75rem",
              marginTop: "0.75rem",
              borderTop: "1px solid var(--border)",
              fontSize: "1.2rem",
              fontWeight: 800,
              marginBottom: "1.25rem",
            }}
          >
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "0.65rem" }}
            disabled={submitting}
            onClick={handleCheckout}
          >
            {submitting
              ? "Procesando..."
              : isAuthenticated
              ? "Confirmar compra"
              : "Iniciar sesión para comprar"}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{ width: "100%" }}
            onClick={clearCart}
          >
            Vaciar carrito
          </button>
        </aside>
      </div>
    </section>
  );
}