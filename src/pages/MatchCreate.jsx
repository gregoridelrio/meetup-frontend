import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./MatchCreate.module.css";

const API_BASE_URL = "/api";

const MATCH_TYPES = ["5v5", "7v7", "11v11"];
const LEVELS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];
const MAX_PLAYERS_BY_TYPE = { "5v5": 10, "7v7": 14, "11v11": 22 };

const extractErrors = (err) => {
  if (err?.errors) return err.errors;
  if (err?.message) return { _global: [err.message] };
  return { _global: ["Ha ocurrido un error inesperado."] };
};

const toApiDate = (localStr) => localStr.replace("T", " ") + ":00";

const minDatetime = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const Field = ({ label, hint, error, children }) => (
  <div className={styles.field}>
    <label className={styles.label}>
      {label}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
    {children}
    {error && <div className={styles.error}>⚠ {error}</div>}
  </div>
);

export default function MatchCreate() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    description: "", starts_at: "", duration: 90, match_type: "7v7",
    max_players: 14, required_level: "beginner", price: 0,
    location_name: "", address: "", city: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleTypeChange = (type) => {
    setForm((f) => ({ ...f, match_type: type, max_players: MAX_PLAYERS_BY_TYPE[type] }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const payload = {
        ...form,
        starts_at: toApiDate(form.starts_at),
        duration: Number(form.duration),
        max_players: Number(form.max_players),
        price: Number(form.price),
      };
      const res = await fetch(`${API_BASE_URL}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      setSuccess(true);
      setTimeout(() => navigate(`/`), 1200);
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a partidos
        </button>

        <h1 className={styles.heading}>
          Crear
          <span className={styles.headingAccent}>Partido</span>
        </h1>
        <p className={styles.subheading}>Rellena los datos y publica tu partido en segundos.</p>

        {errors._global && (
          <div className={styles.globalError}>⚠ {errors._global[0]}</div>
        )}

        {success ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>🎉</div>
            <div className={styles.successTitle}>¡Partido creado!</div>
            <div className={styles.successSub}>Redirigiendo al partido...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* TIPO */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                Tipo de partido
              </div>
              <Field label="Formato" error={errors.match_type?.[0]}>
                <div className={styles.typeGroup}>
                  {MATCH_TYPES.map((t) => (
                    <button key={t} type="button"
                      className={`${styles.typeBtn} ${form.match_type === t ? styles.typeBtnActive : ""}`}
                      onClick={() => handleTypeChange(t)}
                    >
                      {t}
                      <span className={styles.typeSub}>{MAX_PLAYERS_BY_TYPE[t]} jugadores</span>
                    </button>
                  ))}
                </div>
              </Field>
              <div className={styles.row}>
                <Field label="Nivel requerido" error={errors.required_level?.[0]}>
                  <select className={`${styles.select} ${errors.required_level ? styles.inputError : ""}`}
                    value={form.required_level} onChange={(e) => set("required_level", e.target.value)}>
                    {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>
                <Field label="Máx. jugadores" error={errors.max_players?.[0]}>
                  <input type="number" min={2} max={30}
                    className={`${styles.input} ${errors.max_players ? styles.inputError : ""}`}
                    value={form.max_players} onChange={(e) => set("max_players", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* FECHA */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Fecha y duración
              </div>
              <Field label="Fecha y hora de inicio" error={errors.starts_at?.[0]}>
                <input type="datetime-local" min={minDatetime()}
                  className={`${styles.input} ${errors.starts_at ? styles.inputError : ""}`}
                  value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
              </Field>
              <Field label="Duración" hint="en minutos">
                <div className={styles.stepper}>
                  <button type="button" className={styles.stepBtn} onClick={() => set("duration", Math.max(30, form.duration - 15))}>−</button>
                  <span className={styles.stepVal}>{form.duration} min</span>
                  <button type="button" className={styles.stepBtn} onClick={() => set("duration", Math.min(180, form.duration + 15))}>+</button>
                </div>
              </Field>
            </div>

            {/* UBICACIÓN */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Ubicación
              </div>
              <Field label="Nombre del campo" error={errors.location_name?.[0]}>
                <input type="text" placeholder="Camp Municipal..."
                  className={`${styles.input} ${errors.location_name ? styles.inputError : ""}`}
                  value={form.location_name} onChange={(e) => set("location_name", e.target.value)} />
              </Field>
              <div className={styles.row}>
                <Field label="Dirección" error={errors.address?.[0]}>
                  <input type="text" placeholder="Carrer Gran Via 1"
                    className={`${styles.input} ${errors.address ? styles.inputError : ""}`}
                    value={form.address} onChange={(e) => set("address", e.target.value)} />
                </Field>
                <Field label="Ciudad" error={errors.city?.[0]}>
                  <input type="text" placeholder="Barcelona"
                    className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                    value={form.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* PRECIO */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                Precio y descripción
              </div>
              <Field label="Precio por jugador" error={errors.price?.[0]}>
                <div className={styles.priceWrap}>
                  <button type="button"
                    className={`${styles.priceFreeBtn} ${form.price === 0 ? styles.priceFreeBtnActive : ""}`}
                    onClick={() => set("price", form.price === 0 ? 5 : 0)}>
                    {form.price === 0 ? "✓ Gratis" : "Gratis"}
                  </button>
                  <input type="number" min={0} step={0.5} placeholder="5"
                    className={`${styles.input} ${errors.price ? styles.inputError : ""}`}
                    value={form.price === 0 ? "" : form.price}
                    disabled={form.price === 0}
                    style={{ opacity: form.price === 0 ? 0.4 : 1 }}
                    onChange={(e) => set("price", e.target.value === "" ? 0 : Number(e.target.value))} />
                  <span className={styles.priceSymbol}>€</span>
                </div>
              </Field>
              <Field label="Descripción" hint="opcional" error={errors.description?.[0]}>
                <textarea placeholder="Describe el partido, nivel esperado, normas..."
                  className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                  value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>

          </form>
        )}
      </div>

      {!success && (
        <div className={styles.submitBar}>
          <div className={styles.submitInfo}>
            <strong className={styles.submitInfoStrong}>
              {form.match_type} · {form.city || "Sin ciudad"}
            </strong>
            {form.price === 0 ? "Gratis" : `${form.price}€/jugador`} · {form.duration} min
          </div>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? <><div className={styles.spinner} /> Publicando...</> : "Publicar partido →"}
          </button>
        </div>
      )}
    </>
  );
}