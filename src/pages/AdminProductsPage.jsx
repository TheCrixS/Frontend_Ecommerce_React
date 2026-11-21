import { useState, useEffect } from "react";
import { Pencil, Trash2, PlusCircle, X } from "lucide-react";
import { productService } from "../services/productService";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll({ limit: 100 });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleEditClick = (product) => {
    setError("");
    setSuccess("");
    setEditingId(product.id);
    setForm({
      title: product.title,
      volume_number: product.volume_number,
      comic_type: product.comic_type,
      author: product.author,
      publisher: product.publisher,
      isbn: product.isbn || "",
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      cover_image_url: product.cover_image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      if (editingId) {
        await productService.update(editingId, payload);
        setSuccess("Producto actualizado correctamente.");
      } else {
        await productService.create(payload);
        setSuccess("Producto creado correctamente.");
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(". "));
      } else {
        setError(detail || "No se pudo guardar el producto.");
      }
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
        err.response?.data?.detail ||
          "No se pudo eliminar el producto (puede tener órdenes asociadas)."
      );
    }
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1>Panel de Administración — Catálogo</h1>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="card-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1.15rem" }}>
            {editingId ? `Editando producto #${editingId}` : "Agregar nuevo tomo"}
          </h2>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              <X size={16} />
              <span>Cancelar edición</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
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
              <label htmlFor="price">Precio *</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.price}
                onChange={handleChange}
                placeholder="14.99"
              />
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

          <div className="form-group">
            <label htmlFor="cover_image_url">URL de portada (opcional)</label>
            <input
              id="cover_image_url"
              name="cover_image_url"
              type="url"
              value={form.cover_image_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

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
              {submitting
                ? "Guardando..."
                : editingId
                ? "Guardar cambios"
                : "Crear producto"}
            </span>
          </button>
        </form>
      </div>

      <div className="card-box">
        <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
          Productos registrados ({products.length})
        </h2>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Cargando inventario...</p>
        ) : products.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            Aún no hay tomos en el catálogo. Crea el primero arriba.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      <strong>
                        {product.title} #{product.volume_number}
                      </strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                        {product.author} &middot; {product.publisher}
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{product.comic_type}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleEditClick(product)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
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