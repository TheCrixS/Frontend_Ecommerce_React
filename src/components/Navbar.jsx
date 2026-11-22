import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  ShieldCheck,
  LogOut,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu} aria-label="Manga y Cómics, inicio">
          <img src="/logo-manga-comics.png" alt="Manga y Cómics" className="brand-logo" />
        </Link>

        <button
          type="button"
          className="btn btn-ghost btn-icon nav-toggle"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`navbar-links ${menuOpen ? "open" : ""}`} onClick={closeMenu}>
          <NavLink to="/" end className={linkClass}>
            <LayoutGrid size={16} />
            <span>Catálogo</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/orders" className={linkClass}>
              <Package size={16} />
              <span>Mis pedidos</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin/products" className={linkClass}>
              <ShieldCheck size={16} />
              <span>Admin</span>
            </NavLink>
          )}

          <NavLink to="/cart" className={linkClass} aria-label={`Carrito, ${totalItems} artículos`}>
            <ShoppingCart size={16} />
            <span>Carrito</span>
            {totalItems > 0 && (
              <span key={totalItems} className="cart-badge">
                {totalItems}
              </span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <div className="nav-user">
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-profile ${isActive ? "active" : ""}`}
                title="Mi perfil"
              >
                <span className="avatar" aria-hidden="true">
                  {user.full_name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="nav-profile-label">Mi perfil</span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
              >
                <LogOut size={15} />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Ingresar
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Crear cuenta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
