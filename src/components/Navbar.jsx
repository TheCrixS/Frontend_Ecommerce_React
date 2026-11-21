import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ShoppingCart, Package, ShieldCheck, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <BookOpen size={22} />
          <span>Manga &amp; Comics</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/" className="nav-link">
            Catálogo
          </Link>

          {isAuthenticated && (
            <Link to="/orders" className="nav-link">
              <Package size={17} />
              <span>Mis Órdenes</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin/products" className="nav-link">
              <ShieldCheck size={17} />
              <span>Admin</span>
            </Link>
          )}

          <Link to="/cart" className="nav-link">
            <ShoppingCart size={17} />
            <span>Carrito</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {isAuthenticated ? (
            <>
              <span className="nav-link" style={{ color: "var(--muted)" }}>
                <User size={16} />
                <span>{user.full_name}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Ingresar
              </Link>
              <Link to="/register" className="btn btn-primary">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}