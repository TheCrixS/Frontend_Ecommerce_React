import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, PlusCircle, X, ImagePlus, Search } from "lucide-react";
import { productService } from "../services/productService";
import AdminTabs from "../components/AdminTabs";
import { CoverImage } from "../components/ProductCard";
import { formatCOP, getErrorMessage, resolveImageUrl, TYPE_LABELS } from "../utils/format";

const INITIAL_FORM = {
  title: "",
  volume_number: 1,
  comic_type: "manga",
  author: "",
  publisher: "",
  isbn: "",
  description: "",
  price: "",
  stock: 0,
  cover_image_url: "",
};

const MAX_IMAGE_MB = 5;
const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/gif";

async function fetchAllProducts() {
  // El backend limita cada página a 100 tomos
  const all = [];
  for (let skip = 0; ; skip += 100) {
    const page = await productService.getAll({ skip, limit: 100 });
    all.push(...page);
    if (page.length < 100) return all;
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      setProducts(await fetchAllProducts());
    } catch (err) {
      setError(getErrorMessage(err, "Error al cargar los productos."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Libera la URL temporal de la vista previa al cambiar o quitar la imagen
  useEffect(() => {
    if (!imagePreview) return undefined;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const pickImage = (file) => {
    if (!file) return;
    if (!ACCEPTED_IMAGES.split(",").includes(file.type)) {
      setError("Formato no soportado. Usa JPG, PNG, WEBP o GIF.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`La imagen supera ${MAX_IMAGE_MB} MB.`);
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickImage(e.dataTransfer.files?.[0]);
  };

  const handleEditClick = (product) => {
    setError("");
    setSuccess("");
    setEditingId(product.id);
    setImageFile(null);
    setImagePreview("");
    setForm({
      title: product.title,
      volume_number: product.volume_number,
      comic_type: product.comic_type,
      author: product.author,
      publisher: product.publisher,
      isbn: product.isbn || "",
      description: product.description || "",
      price: Number(product.price),
      stock: product.stock,
      cover_image_url: product.cover_image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveImage = async () => {
    if (imageFile) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    if (!editingId || !form.cover_image_url) return;
    try {
      await productService.removeImage(editingId);
      setForm((prev) => ({ ...prev, cover_image_url: "" }));
      setSuccess("Portada eliminada.");
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo quitar la portada."));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const payload = {
      title: form.title.trim(),
      volume_number: Number(form.volume_number),
      comic_type: form.comic_type,
      author: form.author.trim(),
      publisher: form.publisher.trim(),
      isbn: form.isbn.trim() || null,
      description: form.description.trim() || null,
      price: Number(form.price),
      stock: Number(form.stock),
      cover_image_url: form.cover_image_url.trim() || null,
    };

    try {
      const saved = editingId
        ? await productService.update(editingId, payload)
        : await productService.create(payload);
      if (imageFile) {
        await productService.uploadImage(saved.id, imageFile);
      }
      setSuccess(editingId ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo guardar el producto."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `¿Eliminar "${product.title} #${product.volume_number}" del catálogo?`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await productService.remove(product.id);
      setSuccess("Producto eliminado.");
      if (editingId === product.id) resetForm();
      await loadProducts();
    } catch (err) {
      setError(
        getErrorMessage(err, "No se pudo eliminar el producto (puede tener órdenes asociadas).")
      );
    }
  };

  const currentCover = imagePreview || resolveImageUrl(form.cover_image_url);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = normalizedQuery
    ? products.filter((p) =>
        `${p.title} ${p.author} ${p.publisher}`.toLowerCase().includes(normalizedQuery)
      )
    : products;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const withoutCover = products.filter((p) => !p.cover_image_url).length;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Administración</span>
          <h1>Catálogo</h1>
        </div>
        <AdminTabs />
      </div>

      <div className="stat-grid">
        <div className="stat">
          <span>Tomos</span>
          <strong>{products.length}</strong>
        </div>
        <div className="stat">
          <span>Unidades en stock</span>
          <strong>{totalStock}</strong>
        </div>
        <div className="stat">
          <span>Sin portada</span>
          <strong>{withoutCover}</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card-box">
        <div className="order-head" style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0 }}>
            {editingId ? `Editando tomo #${editingId}` : "Agregar nuevo tomo"}
          </h2>
          {editingId && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
              <X size={16} />
              <span>Cancelar edición</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="admin-editor">
          <div>
            <label
              className={`image-drop ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {currentCover ? (
                <img src={currentCover} alt="Vista previa de la portada" />
              ) : (
                <>
                  <ImagePlus size={30} />
                  <strong>Sube la portada</strong>
                  <span>Arrastra una imagen o haz clic. JPG, PNG o WEBP hasta {MAX_IMAGE_MB} MB.</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGES}
                onChange={(e) => {
                  pickImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <div className="image-actions">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={14} />
                <span>{currentCover ? "Cambiar" : "Elegir"}</span>
              </button>
              {currentCover && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleRemoveImage}>
                  <Trash2 size={14} />
                  <span>Quitar</span>
                </button>
              )}
            </div>
            {imageFile && (
              <p className="form-hint" style={{ marginTop: "0.5rem" }}>
                Se subirá al guardar: {imageFile.name}
              </p>
            )}
          </div>

          <div>
            <div className="admin-form-grid">
              <div className="form-group">
                <label htmlFor="title">Título *</label>
                <input
                  id="title"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ej. Solo Leveling"
                />
              </div>

              <div className="form-group">
                <label htmlFor="volume_number">Tomo # *</label>
                <input
                  id="volume_number"
                  name="volume_number"
                  type="number"
                  min={1}
                  required
                  value={form.volume_number}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="comic_type">Categoría *</label>
                <select
                  id="comic_type"
                  name="comic_type"
                  value={form.comic_type}
                  onChange={handleChange}
                >
                  <option value="manga">Manga (Japón)</option>
                  <option value="comic">Cómic (Occidental)</option>
                  <option value="manhwa">Manhwa (Corea)</option>
                  <option value="manhua">Manhua (China)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="author">Autor *</label>
                <input
                  id="author"
                  name="author"
                  required
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Ej. Chugong"
                />
              </div>

              <div className="form-group">
                <label htmlFor="publisher">Editorial *</label>
                <input
                  id="publisher"
                  name="publisher"
                  required
                  value={form.publisher}
                  onChange={handleChange}
                  placeholder="Ej. Panini / Norma"
                />
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN (opcional)</label>
                <input
                  id="isbn"
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  placeholder="978-..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Precio (COP) *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="100"
                  min="100"
                  required
                  value={form.price}
                  onChange={handleChange}
                  placeholder="45000"
                />
                {form.price !== "" && <span className="form-hint">{formatCOP(form.price)}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock *</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min={0}
                  required
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            {!imageFile && (
              <div className="form-group">
                <label htmlFor="cover_image_url">O pega la URL de una portada (opcional)</label>
                <input
                  id="cover_image_url"
                  name="cover_image_url"
                  value={form.cover_image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="description">Sinopsis (opcional)</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Breve reseña del tomo..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <PlusCircle size={17} />
              <span>
                {submitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="card-box">
        <div className="order-head" style={{ marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Productos registrados ({products.length})</h2>
          <label className="search-box">
            <Search size={16} />
            <span className="sr-only">Filtrar productos</span>
            <input
              type="search"
              placeholder="Filtrar por título, autor o editorial"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : visibleProducts.length === 0 ? (
          <p className="muted">No hay tomos que coincidan.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tomo</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product">
                        <span className="product-cover-wrapper thumb thumb-sm">
                          <CoverImage product={product} />
                        </span>
                        <div>
                          <strong>
                            {product.title} #{product.volume_number}
                          </strong>
                          <div className="product-meta">
                            {product.author} · {product.publisher}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge`} style={{ color: `var(--color-${product.comic_type})` }}>
                        {TYPE_LABELS[product.comic_type]}
                      </span>
                    </td>
                    <td>{formatCOP(product.price)}</td>
                    <td style={{ color: product.stock <= 0 ? "var(--color-danger)" : undefined }}>
                      {product.stock}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-icon"
                          aria-label={`Editar ${product.title}`}
                          onClick={() => handleEditClick(product)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-icon"
                          aria-label={`Eliminar ${product.title}`}
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
