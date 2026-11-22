import { DEPARTMENTS, PHONE_PATTERN } from "../utils/colombia";

// Campos de contacto y envío compartidos por el perfil y el carrito.
// `value` tiene: name, phone, address, city, department.
export default function AddressFields({ value, onChange, idPrefix = "addr", required = false, showName = true }) {
  const handle = (e) => onChange(e.target.name, e.target.value);
  const id = (field) => `${idPrefix}_${field}`;

  return (
    <div className="address-fields">
      {showName && (
        <div className="form-group">
          <label htmlFor={id("name")}>{required ? "Quién recibe" : "Nombre completo"}</label>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={value.name}
            onChange={handle}
            placeholder="Nombre y apellido"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor={id("phone")}>Teléfono{required ? "" : " (opcional)"}</label>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          autoComplete="tel"
          required={required}
          maxLength={20}
          pattern={PHONE_PATTERN}
          title="Solo números, espacios, guiones y un + al inicio"
          value={value.phone}
          onChange={handle}
          placeholder="300 123 4567"
        />
      </div>

      <div className="form-group form-group-wide">
        <label htmlFor={id("address")}>Dirección{required ? "" : " (opcional)"}</label>
        <input
          id={id("address")}
          name="address"
          autoComplete="street-address"
          required={required}
          maxLength={255}
          value={value.address}
          onChange={handle}
          placeholder="Calle 45 # 12-30, apto 502, barrio Teusaquillo"
        />
      </div>

      <div className="form-group">
        <label htmlFor={id("city")}>Ciudad o municipio</label>
        <input
          id={id("city")}
          name="city"
          autoComplete="address-level2"
          required={required}
          maxLength={80}
          value={value.city}
          onChange={handle}
          placeholder="Bogotá"
        />
      </div>

      <div className="form-group">
        <label htmlFor={id("department")}>Departamento</label>
        <select
          id={id("department")}
          name="department"
          autoComplete="address-level1"
          required={required}
          value={value.department}
          onChange={handle}
        >
          <option value="">Selecciona...</option>
          {/* Conserva un valor guardado que no esté en la lista */}
          {value.department && !DEPARTMENTS.includes(value.department) && (
            <option value={value.department}>{value.department}</option>
          )}
          {DEPARTMENTS.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
