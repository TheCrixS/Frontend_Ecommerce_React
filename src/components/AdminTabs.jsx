import { NavLink } from "react-router-dom";

export default function AdminTabs() {
  const tabClass = ({ isActive }) => (isActive ? "active" : "");
  return (
    <nav className="admin-tabs" aria-label="Secciones de administración">
      <NavLink to="/admin/products" className={tabClass}>
        Catálogo
      </NavLink>
      <NavLink to="/admin/orders" className={tabClass}>
        Pedidos
      </NavLink>
    </nav>
  );
}
