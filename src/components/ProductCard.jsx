import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const TYPE_LABELS = {
  manga: "Manga",
  comic: "Cómic",
  manhwa: "Manhwa",
  manhua: "Manhua",
};

export default function ProductCard({ product }) {
  const { items, addToCart } = useCart();

  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const reachedStockLimit = inCartQty >= product.stock;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-cover-wrapper">
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
      </Link>

      <div className="product-body">
        <Link to={`/products/${product.id}`} className="product-title">
          {product.title} #{product.volume_number}
        </Link>
        <p className="product-meta">
          {product.author} &middot; {product.publisher}
        </p>

        <div className="product-footer">
          <div className="product-price-row">
            <span className="product-price">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className={`stock-label ${isOutOfStock ? "out" : ""}`}>
              {isOutOfStock ? "Agotado" : `Stock: ${product.stock}`}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={isOutOfStock || reachedStockLimit}
            onClick={() => addToCart(product, 1)}
          >
            <ShoppingCart size={16} />
            <span>
              {isOutOfStock
                ? "Sin stock"
                : reachedStockLimit
                ? "Máximo en carrito"
                : "Agregar al carrito"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}