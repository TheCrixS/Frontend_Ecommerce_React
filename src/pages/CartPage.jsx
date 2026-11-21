import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { CoverImage } from "../components/ProductCard";
import { formatCOP, getErrorMessage, maxUnits } from "../utils/format";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [shippingAddress, setShippingAddress] = useState(user?.shipping_address || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      // La orden se crea pendiente (reserva el stock) y luego se paga en el checkout
      const order = await orderService.create(items, shippingAddress.trim());
      clearCart();
      navigate(`/checkout/${order.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo procesar tu orden. Revisa el stock disponible."));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">
          <ShoppingBag size={28} />
        </span>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega mangas, cómics, manhwas o manhuas desde el catálogo.</p>
        <Link to="/" className="btn btn-primary">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Paso 1 de 2</span>
          <h1>Tu carrito</h1>
          <p>
            {totalItems} {totalItems === 1 ? "tomo" : "tomos"} listos para llevar.
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clearCart}>
          <Trash2 size={15} />
          <span>Vaciar carrito</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="cart-layout">
        <div className="card-box">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="cart-row">
              <Link to={`/products/${product.id}`} className="product-cover-wrapper thumb">
                <CoverImage product={product} />
              </Link>

              <div>
                <Link to={`/products/${product.id}`} className="product-title">
                  {product.title} <span className="volume-tag">#{product.volume_number}</span>
                </Link>
                <span className="product-meta" style={{ display: "block" }}>
                  {formatCOP(product.price)} c/u · máx. {maxUnits(product)}
                </span>
              </div>

              <div className="cart-row-actions">
                <div className="qty-control">
                  <button
                    type="button"
                    aria-label="Quitar uno"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    aria-label="Agregar uno"
                    disabled={quantity >= maxUnits(product)}
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <strong className="line-total">
                  {formatCOP(Number(product.price) * quantity)}
                </strong>

                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeFromCart(product.id)}
                  aria-label={`Eliminar ${product.title} del carrito`}
                >
                  <Trash2 size={16} color="var(--color-danger)" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form className="card-box summary" onSubmit={handleCheckout}>
          <h2>Resumen</h2>
          <div className="summary-line">
            <span>Subtotal ({totalItems})</span>
            <span>{formatCOP(totalPrice)}</span>
          </div>
          <div className="summary-line">
            <span>Envío</span>
            <span style={{ color: "var(--color-success)" }}>Gratis</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>{formatCOP(totalPrice)}</span>
          </div>

          {isAuthenticated && (
            <div className="form-group" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
              <label htmlFor="shipping_address">Dirección de envío</label>
              <input
                id="shipping_address"
                required
                maxLength={255}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Calle, número, ciudad"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={submitting}
          >
            {submitting ? (
              "Creando pedido..."
            ) : isAuthenticated ? (
              <>
                <span>Continuar al pago</span>
                <ArrowRight size={18} />
              </>
            ) : (
              "Inicia sesión para comprar"
            )}
          </button>
          <p className="form-hint" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Lock size={13} /> Pago simulado: no se cobra dinero real.
          </p>
        </form>
      </div>
    </section>
  );
}
