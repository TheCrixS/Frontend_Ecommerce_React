import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import { productService } from "../services/productService";
import { useCart } from "../context/CartContext";
import { CoverImage } from "../components/ProductCard";
import { formatCOP, getErrorMessage, maxUnits, TYPE_LABELS } from "../utils/format";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { items, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.getById(id);
        setProduct(data);
      } catch (err) {
        setError(getErrorMessage(err, "No se encontró el tomo solicitado."));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-grid">
        <div className="skeleton" style={{ aspectRatio: "2 / 3" }} />
        <div className="detail-info">
          <div className="skeleton" style={{ height: 60 }} />
          <div className="skeleton" style={{ height: 160 }} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page">
        <div className="alert alert-error">{error || "Producto no disponible."}</div>
        <div>
          <Link to="/" className="btn btn-outline">
            <ArrowLeft size={16} />
            <span>Volver al catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  const inCartItem = items.find((item) => item.product.id === product.id);
  const inCartQty = inCartItem ? inCartItem.quantity : 0;
  const maxAddable = Math.max(0, maxUnits(product) - inCartQty);

  const handleAdd = () => {
    if (maxAddable <= 0) return;
    addToCart(product, Math.min(quantity, maxAddable));
    setQuantity(1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);
  };

  return (
    <section className="page">
      <div>
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </Link>
      </div>

      <div className="detail-grid">
        <div className="product-cover-wrapper detail-cover">
          <CoverImage product={product} />
          <span className={`type-badge ${product.comic_type}`}>
            {TYPE_LABELS[product.comic_type] || product.comic_type}
          </span>
        </div>

        <div className="detail-info">
          <div>
            <span className="eyebrow">
              {product.publisher} · Tomo {product.volume_number}
            </span>
            <h1>{product.title}</h1>
            <p className="muted">por {product.author}</p>
          </div>

          <p className="detail-price">{formatCOP(product.price)}</p>

          <p className="muted" style={{ whiteSpace: "pre-line" }}>
            {product.description || "Este tomo aún no tiene sinopsis registrada."}
          </p>

          <dl className="detail-specs">
            <div>
              <dt>Autor</dt>
              <dd>{product.author}</dd>
            </div>
            <div>
              <dt>Editorial</dt>
              <dd>{product.publisher}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{product.isbn || "No registrado"}</dd>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd style={{ color: product.stock > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                {product.stock > 0 ? `${product.stock} unidades` : "Agotado"}
              </dd>
            </div>
          </dl>

          {addedFeedback && (
            <div className="alert alert-success">
              Tomo agregado al carrito. <Link to="/cart"><strong>Ver carrito →</strong></Link>
            </div>
          )}

          <div className="buy-box">
            <div className="qty-control">
              <button
                type="button"
                aria-label="Quitar uno"
                disabled={quantity <= 1 || maxAddable <= 0}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span>{maxAddable > 0 ? Math.min(quantity, maxAddable) : 0}</span>
              <button
                type="button"
                aria-label="Agregar uno"
                disabled={quantity >= maxAddable || maxAddable <= 0}
                onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={maxAddable <= 0}
              onClick={handleAdd}
            >
              <ShoppingCart size={18} />
              <span>
                {product.stock <= 0
                  ? "Agotado"
                  : maxAddable <= 0
                  ? "Ya tienes el máximo de este tomo en el carrito"
                  : "Agregar al carrito"}
              </span>
            </button>
          </div>

          <div className="summary-line" style={{ gap: "1.5rem", justifyContent: "flex-start" }}>
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <Truck size={16} /> Envío a toda Colombia
            </span>
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <ShieldCheck size={16} /> Pago simulado, sin cobros reales
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
