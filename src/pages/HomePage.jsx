import { useState, useEffect } from "react";
import { Search, SearchX, ArrowDown } from "lucide-react";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { resolveImageUrl, getErrorMessage } from "../utils/format";

const PAGE_SIZE = 24;

const CATEGORIES = [
  { value: "manga", label: "Manga", origin: "Japón" },
  { value: "comic", label: "Cómic", origin: "Occidente" },
  { value: "manhwa", label: "Manhwa", origin: "Corea del Sur" },
  { value: "manhua", label: "Manhua", origin: "China" },
];

const FEATURED_TITLES = ["Chainsaw Man", "Solo Leveling", "One Piece"];

function HeroCovers() {
  const [covers, setCovers] = useState([]);

  useEffect(() => {
    productService
      .getAll({ limit: 100 })
      .then((data) => {
        const withCover = data.filter((p) => p.cover_image_url);
        const featured = FEATURED_TITLES.map((title) =>
          withCover.find((p) => p.title === title)
        ).filter(Boolean);
        setCovers((featured.length === 3 ? featured : withCover).slice(0, 3));
      })
      .catch(() => setCovers([]));
  }, []);

  return (
    <div className="hero-covers" aria-hidden="true">
      {covers.map((product) => (
        <div key={product.id} className="hero-cover">
          <img src={resolveImageUrl(product.cover_image_url)} alt="" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [comicType, setComicType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await productService.getAll({
          limit: PAGE_SIZE,
          comicType,
          search: search.trim(),
        });
        setProducts(data);
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        setError(
          getErrorMessage(err, "No se pudo cargar el catálogo. Verifica que el backend esté activo.")
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [comicType, search]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await productService.getAll({
        skip: products.length,
        limit: PAGE_SIZE,
        comicType,
        search: search.trim(),
      });
      setProducts((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar más tomos."));
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleCategory = (value) => {
    setComicType((current) => (current === value ? "" : value));
  };

  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="page">
      <div className="hero">
        <div>
          <span className="eyebrow">Nuevos tomos cada semana</span>
          <h1>
            Tu próxima <span className="burst">obsesión</span> empieza aquí
          </h1>
          <p>
            Mangas, cómics, manhwas y manhuas originales con envío a toda Colombia.
            Encuentra el tomo que te falta para completar tu colección.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={scrollToCatalog}>
              <span>Explorar catálogo</span>
              <ArrowDown size={18} />
            </button>
            <button
              type="button"
              className="btn btn-highlight btn-lg"
              onClick={() => {
                setComicType("manhwa");
                scrollToCatalog();
              }}
            >
              Ver manhwas
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <strong>4</strong>
              <span>estilos de cómic</span>
            </div>
            <div>
              <strong>COP</strong>
              <span>precios en pesos</span>
            </div>
            <div>
              <strong>Nequi · PSE</strong>
              <span>y tarjeta</span>
            </div>
          </div>
        </div>
        <HeroCovers />
      </div>

      <div className="category-grid" id="catalogo">
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            className={`category-tile ${category.value} ${
              comicType === category.value ? "active" : ""
            }`}
            aria-pressed={comicType === category.value}
            onClick={() => toggleCategory(category.value)}
          >
            <span className="tile-dot" />
            <strong>{category.label}</strong>
            <span>{category.origin}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="filter-pills">
          <button
            type="button"
            className={`pill ${comicType === "" ? "active" : ""}`}
            onClick={() => setComicType("")}
          >
            Todos
          </button>
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

        <label className="search-box">
          <Search size={18} />
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            placeholder="Busca por título o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="product-grid" aria-busy="true">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <SearchX size={28} />
          </span>
          <h2>No encontramos tomos</h2>
          <p>Prueba con otro título, autor o categoría.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index % PAGE_SIZE} />
            ))}
          </div>
          {hasMore && (
            <div className="load-more">
              <button
                type="button"
                className="btn btn-outline btn-lg"
                disabled={loadingMore}
                onClick={loadMore}
              >
                {loadingMore ? "Cargando..." : "Cargar más tomos"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
