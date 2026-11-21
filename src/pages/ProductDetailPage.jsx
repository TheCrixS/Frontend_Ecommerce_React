import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { productService } from "../services/productService";
import { useCart } from "../context/CartContext";

const TYPE_LABELS = {
  manga: "Manga",
  comic: "Cómic",
  manhwa: "Manhwa",
  manhua: "Manhua",
};

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
        setError(
          err.response?.data?.detail || "No se encontró el tomo solicitado."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
        Cargando ficha del producto...
      </p>
    );
  }

  if (error || !product) {
    return (
      <div>
        <div className="alert-error">{error || "Producto no disponible."}</div>
        <Link to="/" className="btn btn-outline">
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </Link>
      </div>
    );
  }

  const inCartItem = items.find((item) => item.product.id === product.id);
  const inCartQty = inCartItem ? inCartItem.quantity : 0;
  const maxAddable = Math.max(0, product.stock - inCartQty);

  const handleAdd = () => {
    if (maxAddable <= 0) return;
    addToCart(product, Math.min(quantity, maxAddable));
    setQuantity(1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <section>
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/" className="btn btn-outline">
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </Link>
      </div>

      <div className="detail-grid">
        <div className="product-cover-wrapper" style={{ borderRadius: "0.5rem" }}>
          {product.cover_image_url ? (
            <img
              src={product.cover_image_url}
              alt={`${product.title} Tomo ${product.volume_number}`}
              className="product-cover"
            />
          ) : (
            <div className="product-cover-placeholder">Sin portada</div>
          )}
          <span className={`type-badge ${product.comic_type}`}>
            {TYPE_LABELS[product.comic_type] || product.comic_type}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "1.8rem", lineHeight: 1.2 }}>
            {product.title} — Tomo #{product.volume_number}
          </h1>

          <p
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--primary)",
              marginTop: "0.75rem",
            }}
          >
            ${Number(product.price).toFixed(2)}
          </p>

          <div className="detail-specs">
            <div>
              <strong style={{ display: "block", color: "var(--muted)" }}>Autor</strong>
              <span>{product.author}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "var(--muted)" }}>Editorial</strong>
              <span>{product.publisher}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "var(--muted)" }}>ISBN</strong>
              <span>{product.isbn || "No registrado"}</span>
            </div>
            <div>
              <strong style={{ display: "block", color: "var(--muted)" }}>Disponibilidad</strong>
              <span className={`stock-label ${product.stock <= 0 ? "out" : ""}`}>
                {product.stock > 0 ? `${product.stock} unidades` : "Agotado"}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.4rem" }}>Sinopsis</h2>
            <p style={{ color: "var(--muted)", whiteSpace: "pre-line" }}>
              {product.description || "Este tomo aún no tiene sinopsis registrada."}
            </p>
          </div>

          {addedFeedback && (
            <div className="alert-success">
              Tomo agregado al carrito correctamente.
            </div>
          )}

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div className="qty-control">
              <button
                type="button"
                disabled={quantity <= 1 || maxAddable <= 0}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span>{maxAddable > 0 ? Math.min(quantity, maxAddable) : 0}</span>
              <button
                type="button"
                disabled={quantity >= maxAddable || maxAddable <= 0}
                onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={maxAddable <= 0}
              onClick={handleAdd}
            >
              <ShoppingCart size={18} />
              <span>
                {product.stock <= 0
                  ? "Agotado"
                  : maxAddable <= 0
                  ? "Ya tienes todo el stock en el carrito"
                  : "Agregar al carrito"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}