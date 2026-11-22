import { useState } from "react";
import { Link } from "react-router-dom";
import { Save, KeyRound, MapPin, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import AddressFields from "../components/AddressFields";
import { formatAddress, getErrorMessage } from "../utils/format";

const profileToForm = (user) => ({
  name: user?.full_name || "",
  phone: user?.phone || "",
  address: user?.shipping_address || "",
  city: user?.city || "",
  department: user?.department || "",
});

const EMPTY_PASSWORDS = { current: "", next: "", confirm: "" };

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState(() => profileToForm(user));
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const savedAddress = formatAddress(user || {});
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-CO", { month: "long", year: "numeric" })
    : null;

  const handleFieldChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setProfileMsg(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    try {
      const updated = await updateProfile({
        full_name: form.name.trim(),
        phone: form.phone.trim(),
        shipping_address: form.address.trim(),
        city: form.city.trim(),
        department: form.department,
      });
      setForm(profileToForm(updated));
      setProfileMsg({ type: "success", text: "Tus datos se guardaron." });
    } catch (err) {
      setProfileMsg({ type: "error", text: getErrorMessage(err, "No se pudieron guardar tus datos.") });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPasswordMsg(null);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "Las contraseñas nuevas no coinciden." });
      return;
    }
    setChangingPassword(true);
    setPasswordMsg(null);
    try {
      await authService.changePassword(passwords.current, passwords.next);
      setPasswords(EMPTY_PASSWORDS);
      setPasswordMsg({ type: "success", text: "Tu contraseña se actualizó." });
    } catch (err) {
      setPasswordMsg({ type: "error", text: getErrorMessage(err, "No se pudo cambiar la contraseña.") });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div className="profile-heading">
          <span className="avatar avatar-lg">{user.full_name.trim().charAt(0).toUpperCase()}</span>
          <div>
            <span className="eyebrow">Mi cuenta</span>
            <h1>{user.full_name}</h1>
            <p>
              {user.email}
              {memberSince && ` · Cliente desde ${memberSince}`}
            </p>
          </div>
        </div>
        <Link to="/orders" className="btn btn-ghost btn-sm">
          <Package size={16} />
          <span>Mis pedidos</span>
        </Link>
      </div>

      <div className="profile-layout">
        <form className="card-box" onSubmit={handleSaveProfile}>
          <h2>Datos personales y de envío</h2>
          <p className="form-hint profile-intro">
            Usaremos esta dirección para llenar tus pedidos automáticamente. Puedes cambiarla
            aquí o en el carrito antes de comprar.
          </p>

          {profileMsg && <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>}

          <div className="form-group">
            <label htmlFor="profile_email">Correo electrónico</label>
            <input id="profile_email" value={user.email} disabled readOnly />
            <span className="form-hint">Es tu usuario para iniciar sesión, no se puede cambiar.</span>
          </div>

          <AddressFields value={form} onChange={handleFieldChange} idPrefix="profile" />

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
          </button>
        </form>

        <div className="profile-side">
          <div className="card-box">
            <h2>Dirección guardada</h2>
            {savedAddress ? (
              <div className="address-card">
                <MapPin size={18} />
                <div>
                  <strong>{user.full_name}</strong>
                  <span>{savedAddress}</span>
                  {user.phone && <span>Tel. {user.phone}</span>}
                </div>
              </div>
            ) : (
              <p className="muted">
                Aún no tienes una dirección. Agrégala y la usaremos en tus próximos pedidos.
              </p>
            )}
          </div>

          <form className="card-box" onSubmit={handleChangePassword}>
            <h2>Cambiar contraseña</h2>

            {passwordMsg && (
              <div className={`alert alert-${passwordMsg.type}`}>{passwordMsg.text}</div>
            )}

            <div className="form-group">
              <label htmlFor="current_password">Contraseña actual</label>
              <input
                id="current_password"
                name="current"
                type="password"
                autoComplete="current-password"
                required
                maxLength={72}
                value={passwords.current}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new_password">Nueva contraseña</label>
              <input
                id="new_password"
                name="next"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                value={passwords.next}
                onChange={handlePasswordChange}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm_password">Confirmar nueva contraseña</label>
              <input
                id="confirm_password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                maxLength={72}
                value={passwords.confirm}
                onChange={handlePasswordChange}
              />
            </div>
            <button type="submit" className="btn btn-outline" disabled={changingPassword}>
              <KeyRound size={16} />
              <span>{changingPassword ? "Actualizando..." : "Cambiar contraseña"}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
