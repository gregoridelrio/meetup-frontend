import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";

// ── Opciones de selects ───────────────────────────────────────────────────────
const MATCH_TYPES = ["5v5", "7v7", "11v11"];
const LEVELS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];
const MAX_PLAYERS_BY_TYPE = { "5v5": 10, "7v7": 14, "11v11": 22 };

// ── Helpers ───────────────────────────────────────────────────────────────────
const extractErrors = (err) => {
  if (err?.errors) return err.errors;
  if (err?.message) return { _global: [err.message] };
  return { _global: ["Ha ocurrido un error inesperado."] };
};

const toApiDate = (localStr) => (localStr ? localStr.replace("T", " ") + ":00" : "");

const minDatetime = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const Field = ({ label, hint, error, children }) => (
  <div className="cf-field">
    <label className="cf-label">{label}{hint && <span className="cf-hint">{hint}</span>}</label>
    {children}
    {error && <div className="cf-error">⚠ {error}</div>}
  </div>
);

export default function MatchCreate() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    description: "",
    starts_at: "",
    duration: 90,
    match_type: "7v7",
    max_players: 14,
    required_level: "beginner",
    price: 0,
    location_name: "",
    address: "",
    city: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleTypeChange = (type) => {
    setForm((f) => ({ ...f, match_type: type, max_players: MAX_PLAYERS_BY_TYPE[type] }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw data;

      // Si la respuesta es OK (200 o 201), aunque no traiga ID,
      // damos el éxito por bueno y redirigimos a la Home.
      setSuccess(true);

      setTimeout(() => {
        navigate("/"); // <--- Redirección a la página principal
      }, 1000);

    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Tus estilos CSS se mantienen igual... */
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F7F0F0; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        .cf-page { max-width: 680px; margin: 0 auto; padding: 36px 24px 80px; animation: fadeUp 0.3s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }
        .cf-back { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #6a7f64; cursor: pointer; padding: 0; margin-bottom: 28px; transition: color 0.15s; }
        .cf-back:hover { color: #25671E; }
        .cf-heading { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 6vw, 58px); line-height: 0.95; letter-spacing: 0.02em; color: #25671E; margin-bottom: 6px; }
        .cf-heading span { color: #48A111; display: block; }
        .cf-subheading { font-size: 14px; color: #8a9e84; margin-bottom: 32px; }
        .cf-global-error { background: #fff0eb; border: 1.5px solid #f0c4b0; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #c04020; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
        .cf-card { background: #fff; border: 1.5px solid #e8dfdf; border-radius: 16px; padding: 24px 28px; margin-bottom: 16px; }
        .cf-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.06em; color: #25671E; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .cf-field { margin-bottom: 18px; }
        .cf-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6a7f64; margin-bottom: 7px; }
        .cf-hint { font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; color: #b0a0a0; }
        .cf-error { font-size: 12px; color: #e05c2a; margin-top: 5px; }
        .cf-input, .cf-select, .cf-textarea { width: 100%; padding: 11px 14px; background: #faf8f8; border: 1.5px solid #e8dfdf; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a2e14; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .cf-input:focus, .cf-select:focus, .cf-textarea:focus { border-color: #48A111; box-shadow: 0 0 0 3px rgba(72, 161, 17, 0.1); background: #fff; }
        .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cf-type-group { display: flex; gap: 8px; }
        .cf-type-btn { flex: 1; padding: 10px 8px; border: 1.5px solid #e8dfdf; border-radius: 10px; background: #faf8f8; font-size: 14px; font-weight: 600; color: #8a9e84; cursor: pointer; text-align: center; }
        .cf-type-btn.active { background: #25671E; border-color: #25671E; color: #F7F0F0; }
        .cf-type-sub { font-size: 11px; font-weight: 400; opacity: 0.75; display: block; }
        .cf-price-wrap { display: flex; gap: 10px; align-items: center; }
        .cf-price-free-btn { padding: 11px 16px; border: 1.5px solid #e8dfdf; border-radius: 10px; background: #faf8f8; font-size: 13px; font-weight: 600; color: #8a9e84; cursor: pointer; }
        .cf-price-free-btn.active { background: #edf7e6; border-color: #48A111; color: #48A111; }
        .cf-stepper { display: flex; align-items: center; border: 1.5px solid #e8dfdf; border-radius: 10px; overflow: hidden; width: fit-content; }
        .cf-step-btn { width: 40px; height: 42px; background: #faf8f8; border: none; font-size: 18px; color: #48A111; cursor: pointer; }
        .cf-step-val { min-width: 72px; text-align: center; font-weight: 600; border-left: 1.5px solid #e8dfdf; border-right: 1.5px solid #e8dfdf; line-height: 42px; }
        .cf-success { text-align: center; padding: 48px 24px; background: #fff; border: 1.5px solid #e8dfdf; border-radius: 16px; }
        .cf-success-icon { font-size: 52px; margin-bottom: 16px; }
        .cf-success-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: #25671E; }
        .cf-submit-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1.5px solid #e8dfdf; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; z-index: 100; box-shadow: 0 -4px 24px rgba(37,103,30,0.08); }
        .cf-submit-btn { padding: 12px 32px; background: #48A111; color: #F7F0F0; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
        .cf-submit-btn:disabled { background: #e8dfdf; cursor: not-allowed; }
        .cf-spinner { width: 15px; height: 15px; border: 2px solid rgba(247,240,240,0.4); border-top-color: #F7F0F0; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 540px) { .cf-row { grid-template-columns: 1fr; } .cf-submit-bar { flex-direction: column; text-align: center; } }
      `}</style>

      <div className="cf-page">
        <button className="cf-back" onClick={() => navigate("/")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a partidos
        </button>

        <h1 className="cf-heading">Crear <span>Partido</span></h1>
        <p className="cf-subheading">Rellena los datos y publica tu partido en segundos.</p>

        {errors._global && <div className="cf-global-error">⚠ {errors._global[0]}</div>}

        {success ? (
          <div className="cf-success">
            <div className="cf-success-icon">🎉</div>
            <div className="cf-success-title">¡Partido creado!</div>
            <p className="cf-success-sub">Redirigiendo a los detalles del partido...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* --- SECCIÓN TIPO --- */}
            <div className="cf-card">
              <div className="cf-card-title">Tipo de partido</div>
              <Field label="Formato" error={errors.match_type?.[0]}>
                <div className="cf-type-group">
                  {MATCH_TYPES.map((t) => (
                    <button
                      key={t} type="button"
                      className={`cf-type-btn${form.match_type === t ? " active" : ""}`}
                      onClick={() => handleTypeChange(t)}
                    >
                      {t}
                      <span className="cf-type-sub">{MAX_PLAYERS_BY_TYPE[t]} jugadores</span>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="cf-row">
                <Field label="Nivel requerido" error={errors.required_level?.[0]}>
                  <select
                    className="cf-select"
                    value={form.required_level}
                    onChange={(e) => set("required_level", e.target.value)}
                  >
                    {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>
                <Field label="Máx. jugadores" error={errors.max_players?.[0]}>
                  <input
                    type="number" className="cf-input"
                    value={form.max_players}
                    onChange={(e) => set("max_players", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* --- SECCIÓN FECHA --- */}
            <div className="cf-card">
              <div className="cf-card-title">Fecha y duración</div>
              <Field label="Fecha y hora de inicio" error={errors.starts_at?.[0]}>
                <input
                  type="datetime-local" min={minDatetime()}
                  className="cf-input"
                  value={form.starts_at}
                  onChange={(e) => set("starts_at", e.target.value)}
                />
              </Field>
              <Field label="Duración" hint="en minutos">
                <div className="cf-stepper">
                  <button type="button" className="cf-step-btn" onClick={() => set("duration", Math.max(30, form.duration - 15))}>−</button>
                  <span className="cf-step-val">{form.duration} min</span>
                  <button type="button" className="cf-step-btn" onClick={() => set("duration", Math.min(180, form.duration + 15))}>+</button>
                </div>
              </Field>
            </div>

            {/* --- SECCIÓN UBICACIÓN --- */}
            <div className="cf-card">
              <div className="cf-card-title">Ubicación</div>
              <Field label="Nombre del campo" error={errors.location_name?.[0]}>
                <input
                  type="text" placeholder="Ej: Camp Nou"
                  className="cf-input"
                  value={form.location_name}
                  onChange={(e) => set("location_name", e.target.value)}
                />
              </Field>
              <div className="cf-row">
                <Field label="Dirección" error={errors.address?.[0]}>
                  <input type="text" className="cf-input" value={form.address} onChange={(e) => set("address", e.target.value)} />
                </Field>
                <Field label="Ciudad" error={errors.city?.[0]}>
                  <input type="text" className="cf-input" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* --- PRECIO --- */}
            <div className="cf-card">
              <div className="cf-card-title">Precio y descripción</div>
              <Field label="Precio por jugador" error={errors.price?.[0]}>
                <div className="cf-price-wrap">
                  <button
                    type="button"
                    className={`cf-price-free-btn${form.price === 0 ? " active" : ""}`}
                    onClick={() => set("price", 0)}
                  >
                    Gratis
                  </button>
                  <input
                    type="number" className="cf-input"
                    placeholder="Efectivo..."
                    value={form.price || ""}
                    onChange={(e) => set("price", e.target.value)}
                  />
                  <span>€</span>
                </div>
              </Field>
              <Field label="Descripción" error={errors.description?.[0]}>
                <textarea
                  className="cf-textarea"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>
          </form>
        )}
      </div>

      {!success && (
        <div className="cf-submit-bar">
          <div>
            <strong>{form.match_type} · {form.city || "Ciudad"}</strong>
            <p>{form.price > 0 ? `${form.price}€` : 'Gratis'}</p>
          </div>
          <button className="cf-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <div className="cf-spinner" /> : "Publicar partido →"}
          </button>
        </div>
      )}
    </>
  );
}