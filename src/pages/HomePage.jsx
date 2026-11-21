import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { value: "", label: "Todos" },
  { value: "manga", label: "Mangas" },
  { value: "comic", label: "Cómics" },
  { value: "manhwa", label: "Manhwas (Corea)" },
  { value: "manhua", label: "Manhuas (China)" },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [comicType, setComicType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.getAll({
          comicType,
          search: search.trim(),
        });
        setProducts(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "No se pudo cargar el catálogo. Verifica que el backend esté activo."
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [comicType, search]);

  return (
    <section>
      <div className="catalog-header">
        <div>
          <h1>Catálogo de Tomos</h1>
          <p style={{ color: "var(--muted)" }}>
            Explora mangas, cómics occidentales, manhwas y manhuas disponibles.
          </p>
        </div>

        <div className="catalog-controls">
          <div className="filter-pills">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`pill ${comicType === category.value ? "active" : ""}`}
                onClick={() => setComicType(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="search-box">
            <Search size={18} color="var(--muted)" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          Cargando catálogo...
        </p>
      ) : products.length === 0 ? (
        <p style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          No se encontraron tomos con los filtros seleccionados.
        </p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}