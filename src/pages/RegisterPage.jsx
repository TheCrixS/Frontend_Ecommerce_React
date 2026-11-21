import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shipping_address: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        shipping_address: form.shipping_address.trim() || null,
      });
      // Inicia sesión automáticamente tras el registro
      await login({ email: form.email.trim(), password: form.password });
      navigate("/", { replace: true });
    } catch (err) {
      // FastAPI devuelve una lista de errores cuando falla la validación (422)
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(". "));
      } else {
        setError(detail || "No se pudo completar el registro.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-art">
        <span className="eyebrow" style={{ color: "white" }}>Únete al club</span>
        <h2>Manga, cómic, manhwa y manhua en un solo lugar.</h2>
        <p>Crea tu cuenta y guarda tu dirección para comprar en segundos.</p>
      </div>
    <div className="auth-card">
      <h1>Crear cuenta</h1>
      <p className="auth-subtitle">
        Regístrate para comprar tus mangas, cómics, manhwas y manhuas.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="full_name">Nombre completo</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={form.full_name}
            onChange={handleChange}
            placeholder="Tu nombre"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group">
          <label htmlFor="shipping_address">Dirección de envío (opcional)</label>
          <input
            id="shipping_address"
            name="shipping_address"
            type="text"
            maxLength={255}
            value={form.shipping_address}
            onChange={handleChange}
            placeholder="Calle, número, ciudad"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg btn-block"
          style={{ marginTop: "0.5rem" }}
          disabled={submitting}
        >
          {submitting ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      <p className="auth-footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
    </div>
  );
}
