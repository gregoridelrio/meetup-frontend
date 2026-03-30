import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Extrae los errores de validación que devuelve Laravel ({ errors: { field: [msg] } })
const extractErrors = (err) => {
  if (err?.errors) return err.errors;          // errores de validación
  if (err?.message) return { _global: [err.message] }; // error genérico
  return { _global: ["Ha ocurrido un error inesperado."] };
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #F7F0F0;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-page {
    width: 100%;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* ── LEFT PANEL ── */
  .auth-panel-left {
    background: #25671E;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    position: relative;
    overflow: hidden;
  }
  .auth-panel-left::before {
    content: '';
    position: absolute;
    width: 480px; height: 480px;
    border: 2px solid rgba(247,240,240,0.07);
    border-radius: 50%;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
  .auth-panel-left::after {
    content: '';
    position: absolute;
    width: 280px; height: 280px;
    border: 2px solid rgba(247,240,240,0.07);
    border-radius: 50%;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
  .left-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
  }
  .left-logo-icon {
    width: 36px; height: 36px;
    background: #48A111;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .left-logo-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 0.08em;
    color: #F7F0F0;
  }
  .left-body {
    position: relative;
    z-index: 1;
  }
  .left-tagline {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(36px, 4vw, 56px);
    line-height: 1;
    color: #F7F0F0;
    margin-bottom: 16px;
  }
  .left-tagline span { color: #F2B50B; display: block; }
  .left-sub {
    font-size: 15px;
    color: rgba(247,240,240,0.55);
    line-height: 1.7;
    max-width: 320px;
  }
  .left-features {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .left-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: rgba(247,240,240,0.65);
  }
  .left-feature-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #48A111;
    flex-shrink: 0;
  }

  /* ── RIGHT PANEL ── */
  .auth-panel-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 56px;
    background: #F7F0F0;
  }
  .auth-form-wrap {
    width: 100%;
    max-width: 380px;
    animation: fadeUp 0.35s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 38px;
    letter-spacing: 0.04em;
    color: #25671E;
    margin-bottom: 6px;
  }
  .auth-subheading {
    font-size: 14px;
    color: #8a9e84;
    margin-bottom: 32px;
    line-height: 1.5;
  }
  .auth-subheading a {
    color: #48A111;
    font-weight: 600;
    text-decoration: none;
  }
  .auth-subheading a:hover { text-decoration: underline; }

  /* ── FORM ELEMENTS ── */
  .form-group {
    margin-bottom: 16px;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6a7f64;
    margin-bottom: 6px;
  }
  .form-input {
    width: 100%;
    padding: 11px 14px;
    background: #fff;
    border: 1.5px solid #e8dfdf;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1a2e14;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .form-input::placeholder { color: #c4b8b8; }
  .form-input:focus {
    border-color: #48A111;
    box-shadow: 0 0 0 3px rgba(72, 161, 17, 0.1);
  }
  .form-input.error {
    border-color: #e05c2a;
    box-shadow: 0 0 0 3px rgba(224, 92, 42, 0.1);
  }
  .field-error {
    font-size: 12px;
    color: #e05c2a;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* ── GLOBAL ERROR ── */
  .global-error {
    background: #fff0eb;
    border: 1.5px solid #f0c4b0;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    color: #c04020;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── SUBMIT BUTTON ── */
  .auth-submit {
    width: 100%;
    padding: 13px;
    background: #48A111;
    color: #F7F0F0;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .auth-submit:hover:not(:disabled) { background: #25671E; transform: translateY(-1px); }
  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* spinner */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(247,240,240,0.4);
    border-top-color: #F7F0F0;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 720px) {
    .auth-page { grid-template-columns: 1fr; }
    .auth-panel-left { display: none; }
    .auth-panel-right { padding: 40px 24px; align-items: flex-start; padding-top: 60px; }
  }
`;

// ── Reusable field component ──────────────────────────────────────────────────

const Field = ({ label, name, type = "text", placeholder, value, onChange, errors }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`form-input${errors?.[name] ? " error" : ""}`}
      autoComplete={type === "password" ? "current-password" : name}
    />
    {errors?.[name] && (
      <div className="field-error">⚠ {errors[name][0]}</div>
    )}
  </div>
);

// ── LEFT PANEL ───────────────────────────────────────────────────────────────

const LeftPanel = ({ mode }) => (
  <div className="auth-panel-left">
    <div className="left-logo">
      <div className="left-logo-icon">⚽</div>
      <span className="left-logo-name">Futbol Meetup</span>
    </div>
    <div className="left-body">
      <h2 className="left-tagline">
        Juega más,
        <span>organiza fácil.</span>
      </h2>
      <p className="left-sub">
        Encuentra partidos cerca de ti, únete en segundos y queda con jugadores de tu nivel.
      </p>
    </div>
    <div className="left-features">
      <div className="left-feature"><div className="left-feature-dot" />Partidos de todos los niveles</div>
      <div className="left-feature"><div className="left-feature-dot" />Organiza y gestiona tu equipo</div>
      <div className="left-feature"><div className="left-feature-dot" />Historial y estadísticas propias</div>
    </div>
  </div>
);

// ── LOGIN PAGE ────────────────────────────────────────────────────────────────

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <div className="auth-page">
        <LeftPanel mode="login" />
        <div className="auth-panel-right">
          <div className="auth-form-wrap">
            <h1 className="auth-heading">Bienvenido</h1>
            <p className="auth-subheading">
              ¿No tienes cuenta?{" "}
              <Link to="/register">Regístrate gratis</Link>
            </p>

            {errors._global && (
              <div className="global-error">
                ⚠ {errors._global[0]}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Field
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                errors={errors}
              />
              <Field
                label="Contraseña"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                errors={errors}
              />
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <><div className="spinner" /> Entrando...</> : "Entrar →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// ── REGISTER PAGE ─────────────────────────────────────────────────────────────

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <div className="auth-page">
        <LeftPanel mode="register" />
        <div className="auth-panel-right">
          <div className="auth-form-wrap">
            <h1 className="auth-heading">Crear cuenta</h1>
            <p className="auth-subheading">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login">Inicia sesión</Link>
            </p>

            {errors._global && (
              <div className="global-error">
                ⚠ {errors._global[0]}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Field
                label="Nombre"
                name="name"
                placeholder="Tu nombre"
                value={form.name}
                onChange={handleChange}
                errors={errors}
              />
              <Field
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                errors={errors}
              />
              <div className="form-row">
                <Field
                  label="Contraseña"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  errors={errors}
                />
                <Field
                  label="Confirmar"
                  name="password_confirmation"
                  type="password"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  errors={errors}
                />
              </div>
              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? <><div className="spinner" /> Creando cuenta...</> : "Crear cuenta →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}