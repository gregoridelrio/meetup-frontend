import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthPages.module.css";

const extractErrors = (err) => {
  if (err?.errors) return err.errors;
  if (err?.message) return { _global: [err.message] };
  return { _global: ["Ha ocurrido un error inesperado."] };
};

// ── Field ─────────────────────────────────────────────────────────────────────

const Field = ({ label, name, type = "text", placeholder, value, onChange, errors }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel} htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${styles.formInput} ${errors?.[name] ? styles.formInputError : ""}`}
      autoComplete={type === "password" ? "current-password" : name}
    />
    {errors?.[name] && (
      <div className={styles.fieldError}>⚠ {errors[name][0]}</div>
    )}
  </div>
);

// ── Left Panel ────────────────────────────────────────────────────────────────

const LeftPanel = () => (
  <div className={styles.panelLeft}>
    <a href="/" className={styles.alogo}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>⚽</div>
        <span className={styles.logoName}>Meetup Football</span>
      </div>
    </a>
    <div className={styles.leftBody}>
      <h2 className={styles.tagline}>
        Juega más,
        <span className={styles.taglineAccent}>organiza fácil.</span>
      </h2>
      <p className={styles.leftSub}>
        Encuentra partidos cerca de ti, únete en segundos y queda con jugadores de tu nivel.
      </p>
    </div>
    <div className={styles.features}>
      <div className={styles.feature}><div className={styles.featureDot} />Partidos de todos los niveles</div>
      <div className={styles.feature}><div className={styles.featureDot} />Organiza y gestiona tu equipo</div>
      <div className={styles.feature}><div className={styles.featureDot} />Historial y estadísticas propias</div>
    </div>
  </div>
);

// ── Login ─────────────────────────────────────────────────────────────────────

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
    <div className={styles.page}>
      <LeftPanel />
      <div className={styles.panelRight}>
        <div className={styles.formWrap}>
          <h1 className={styles.heading}>Bienvenido</h1>
          <p className={styles.subheading}>
            ¿No tienes cuenta?{" "}
            <Link to="/register">Regístrate gratis</Link>
          </p>

          {errors._global && (
            <div className={styles.globalError}>⚠ {errors._global[0]}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Correo electrónico" name="email" type="email"
              placeholder="tu@email.com" value={form.email}
              onChange={handleChange} errors={errors} />
            <Field label="Contraseña" name="password" type="password"
              placeholder="••••••••" value={form.password}
              onChange={handleChange} errors={errors} />
            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? <><div className={styles.spinner} /> Entrando...</> : "Entrar →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Register ──────────────────────────────────────────────────────────────────

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
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
    <div className={styles.page}>
      <LeftPanel />
      <div className={styles.panelRight}>
        <div className={styles.formWrap}>
          <h1 className={styles.heading}>Crear cuenta</h1>
          <p className={styles.subheading}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login">Inicia sesión</Link>
          </p>

          {errors._global && (
            <div className={styles.globalError}>⚠ {errors._global[0]}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Nombre" name="name" placeholder="Tu nombre"
              value={form.name} onChange={handleChange} errors={errors} />
            <Field label="Correo electrónico" name="email" type="email"
              placeholder="tu@email.com" value={form.email}
              onChange={handleChange} errors={errors} />
            <div className={styles.formRow}>
              <Field label="Contraseña" name="password" type="password"
                placeholder="••••••••" value={form.password}
                onChange={handleChange} errors={errors} />
              <Field label="Confirmar" name="password_confirmation" type="password"
                placeholder="••••••••" value={form.password_confirmation}
                onChange={handleChange} errors={errors} />
            </div>
            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? <><div className={styles.spinner} /> Creando cuenta...</> : "Crear cuenta →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}