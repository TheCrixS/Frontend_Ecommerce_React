import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatCOP, maxUnits, resolveImageUrl, TYPE_LABELS } from "../utils/format";

export function CoverImage({ product, className = "product-cover" }) {
  const src = resolveImageUrl(product.cover_image_url);
  if (!src) {
    return (
      <div className="product-cover-placeholder">
        <strong>{product.title}</strong>
        <span>Tomo {product.volume_number}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`Portada de ${product.title}, tomo ${product.volume_number}`}
      className={className}
      loading="lazy"
    />
  );
}

export default function ProductCard({ product, index = 0 }) {
  const { items, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const reachedStockLimit = inCartQty >= maxUnits(product);
  const lowStock = !isOutOfStock && product.stock <= 5;

  const handleAdd = () => {
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      className="product-card"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <Link to={`/products/${product.id}`} className="product-cover-wrapper">
        <CoverImage product={product} />
        <span className={`type-badge ${product.comic_type}`}>
          {TYPE_LABELS[product.comic_type] || product.comic_type}
        </span>
        {(isOutOfStock || lowStock) && (
          <span className={`stock-flag ${isOutOfStock ? "out" : ""}`}>
            {isOutOfStock ? "Agotado" : `¡Quedan ${product.stock}!`}
          </span>
        )}
      </Link>

      <div className="product-body">
        <Link to={`/products/${product.id}`} className="product-title">
          {product.title} <span className="volume-tag">#{product.volume_number}</span>
        </Link>
        <p className="product-meta" title={`${product.author} · ${product.publisher}`}>
          {product.author}
        </p>

        <div className="product-footer">
          <span className="product-price">{formatCOP(product.price)}</span>
          <button
            type="button"
            className={`add-btn ${justAdded ? "added" : ""}`}
            disabled={isOutOfStock || reachedStockLimit}
            onClick={handleAdd}
            aria-label={
              isOutOfStock
                ? "Sin stock"
                : reachedStockLimit
                ? "Ya tienes el máximo de este tomo en el carrito"
                : `Agregar ${product.title} tomo ${product.volume_number} al carrito`
            }
            title={reachedStockLimit && !isOutOfStock ? "Máximo en carrito" : undefined}
          >
            {justAdded ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </article>
  );
}
