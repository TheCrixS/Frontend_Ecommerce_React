export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>© {new Date().getFullYear()} Manga y Cómics · Envíos a toda Colombia</span>
        <span>Precios en pesos colombianos (COP). Pagos simulados: no se cobra dinero real.</span>
      </div>
    </footer>
  );
}
