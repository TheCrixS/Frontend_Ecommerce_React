import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // FastAPI devuelve una lista de errores cuando falla la validación (422)
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(". "));
      } else {
        setError(detail || "Correo o contraseña incorrectos.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-art">
        <span className="eyebrow" style={{ color: "white" }}>Bienvenido de vuelta</span>
        <h2>Tu colección te está esperando.</h2>
        <p>Retoma tus pedidos y sigue el estado de cada envío.</p>
      </div>
    <div className="auth-card">
      <h1>Iniciar sesión</h1>
      <p className="auth-subtitle">
        Accede para gestionar tus compras y pedidos.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg btn-block"
          style={{ marginTop: "0.5rem" }}
          disabled={submitting}
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="auth-footer">
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
    </div>
  );
}