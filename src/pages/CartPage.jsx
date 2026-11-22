import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Lock, MapPin, Pencil } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { CoverImage } from "../components/ProductCard";
import AddressFields from "../components/AddressFields";
import { formatAddress, formatCOP, getErrorMessage, maxUnits } from "../utils/format";

const shippingFromProfile = (user) => ({
  name: user?.full_name || "",
  phone: user?.phone || "",
  address: user?.shipping_address || "",
  city: user?.city || "",
  department: user?.department || "",
});

// La dirección del perfil se usa sin abrir el formulario solo si está completa;
// si le falta algo, el formulario se abre ya llenado con lo que haya
const hasSavedAddress = (user) =>
  Boolean(user?.shipping_address && user?.city && user?.department && user?.phone);

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [shipping, setShipping] = useState(() => shippingFromProfile(user));
  // Con dirección guardada se muestra un resumen; el formulario se abre con "Cambiar"
  const [editingShipping, setEditingShipping] = useState(() => !hasSavedAddress(user));
  const [shippingTouched, setShippingTouched] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(() => !hasSavedAddress(user));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Al iniciar sesión o refrescar el perfil, vuelve a llenar la dirección si el
  // usuario todavía no la ha tocado (ajuste durante el render, sin useEffect)
  const [profileSeen, setProfileSeen] = useState(user);
  if (user !== profileSeen) {
    setProfileSeen(user);
    if (!shippingTouched) {
      setShipping(shippingFromProfile(user));
      setEditingShipping(!hasSavedAddress(user));
      setSaveToProfile(!hasSavedAddress(user));
    }
  }

  const handleShippingChange = (name, value) => {
    setShippingTouched(true);
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const startEditingShipping = () => {
    setShippingTouched(true);
    setEditingShipping(true);
  };

  const useSavedAddress = () => {
    setShipping(shippingFromProfile(user));
    setEditingShipping(false);
    setSaveToProfile(false);
    setShippingTouched(false);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const details = {
        recipient_name: shipping.name.trim(),
        recipient_phone: shipping.phone.trim(),
        shipping_address: shipping.address.trim(),
        shipping_city: shipping.city.trim(),
        shipping_department: shipping.department,
      };
      // La orden se crea pendiente (reserva el stock) y luego se paga en el checkout
      const order = await orderService.create(items, details);

      if (editingShipping && saveToProfile) {
        // El pedido ya quedó creado: si guardar en el perfil falla no se interrumpe la compra
        await updateProfile({
          phone: details.recipient_phone,
          shipping_address: details.shipping_address,
          city: details.shipping_city,
          department: details.shipping_department,
        }).catch(() => {});
      }

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

        <form
          className={`card-box summary ${isAuthenticated && editingShipping ? "summary-static" : ""}`}
          onSubmit={handleCheckout}
        >
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
            <div className="shipping-box">
              <div className="shipping-box-head">
                <h3>Datos de envío</h3>
                {editingShipping ? (
                  hasSavedAddress(user) && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={useSavedAddress}>
                      Usar la guardada
                    </button>
                  )
                ) : (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={startEditingShipping}>
                    <Pencil size={14} />
                    <span>Cambiar</span>
                  </button>
                )}
              </div>

              {editingShipping ? (
                <>
                  <AddressFields
                    value={shipping}
                    onChange={handleShippingChange}
                    idPrefix="ship"
                    required
                  />
                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                    />
                    <span>
                      {hasSavedAddress(user)
                        ? "Reemplazar la dirección guardada en mi perfil"
                        : "Guardar esta dirección en mi perfil"}
                    </span>
                  </label>
                </>
              ) : (
                <div className="address-card">
                  <MapPin size={18} />
                  <div>
                    <strong>{shipping.name}</strong>
                    <span>{formatAddress(user)}</span>
                    <span>Tel. {shipping.phone}</span>
                  </div>
                </div>
              )}
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
