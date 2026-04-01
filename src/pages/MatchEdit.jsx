import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";

// ── Opciones ──────────────────────────────────────────────────────────────────

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

// "2026-04-01 18:00:00" → "2026-04-01T18:00" (formato datetime-local)
const toInputDate = (str) => str ? str.replace(" ", "T").slice(0, 16) : "";

// "2026-04-01T18:00" → "2026-04-01 18:00:00"
const toApiDate = (str) => str.replace("T", " ") + ":00";

// ── Field ─────────────────────────────────────────────────────────────────────

const Field = ({ label, hint, error, children }) => (
  <div className="cf-field">
    <label className="cf-label">
      {label}
      {hint && <span className="cf-hint">{hint}</span>}
    </label>
    {children}
    {error && <div className="cf-error">⚠ {error}</div>}
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MatchEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [form, setForm] = useState(null);   // null = cargando
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Carga el partido actual para prerellenar el formulario
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Solo el organizador puede editar
        if (user && data.organizer?.id !== user.id) {
          navigate(`/matches/${id}`, { replace: true });
          return;
        }

        setForm({
          description: data.description ?? "",
          starts_at: toInputDate(data.starts_at),
          duration: data.duration ?? 90,
          match_type: data.match_type ?? "7v7",
          max_players: data.max_players ?? 14,
          required_level: data.required_level ?? "beginner",
          price: parseFloat(data.price) ?? 0,
          location_name: data.location_name ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
        });
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, user]);

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
      const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
        method: "PUT",
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
      setTimeout(() => navigate(`/matches/${id}`), 1200);
    } catch (err) {
      setErrors(extractErrors(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F7F0F0; font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        .cf-page { max-width: 680px; margin: 0 auto; padding: 36px 24px 100px; animation: fadeUp 0.3s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }

        .cf-back { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #6a7f64; cursor: pointer; padding: 0; margin-bottom: 28px; transition: color 0.15s; }
        .cf-back:hover { color: #25671E; }

        .cf-heading { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 6vw, 58px); line-height: 0.95; letter-spacing: 0.02em; color: #25671E; margin-bottom: 6px; }
        .cf-heading span { color: #48A111; display: block; }
        .cf-subheading { font-size: 14px; color: #8a9e84; margin-bottom: 32px; }

        /* Badge ID del partido */
        .cf-match-id {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          background: #edf7e6; color: #48A111; border: 1px solid #c8e8b0;
          padding: 4px 12px; border-radius: 20px; margin-bottom: 28px;
        }

        .cf-global-error { background: #fff0eb; border: 1.5px solid #f0c4b0; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #c04020; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }

        /* Cards */
        .cf-card { background: #fff; border: 1.5px solid #e8dfdf; border-radius: 16px; padding: 24px 28px; margin-bottom: 16px; }
        .cf-card-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.06em; color: #25671E; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .cf-card-title svg { color: #48A111; }

        /* Fields */
        .cf-field { margin-bottom: 18px; }
        .cf-field:last-child { margin-bottom: 0; }
        .cf-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6a7f64; margin-bottom: 7px; }
        .cf-hint { font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; color: #b0a0a0; }
        .cf-error { font-size: 12px; color: #e05c2a; margin-top: 5px; }

        .cf-input, .cf-select, .cf-textarea { width: 100%; padding: 11px 14px; background: #faf8f8; border: 1.5px solid #e8dfdf; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a2e14; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .cf-input::placeholder, .cf-textarea::placeholder { color: #c4b8b8; }
        .cf-input:focus, .cf-select:focus, .cf-textarea:focus { border-color: #48A111; box-shadow: 0 0 0 3px rgba(72,161,17,0.1); background: #fff; }
        .cf-input.has-error, .cf-select.has-error, .cf-textarea.has-error { border-color: #e05c2a; box-shadow: 0 0 0 3px rgba(224,92,42,0.08); }
        .cf-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2348A111' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        .cf-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }

        .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* Match type toggle */
        .cf-type-group { display: flex; gap: 8px; }
        .cf-type-btn { flex: 1; padding: 10px 8px; border: 1.5px solid #e8dfdf; border-radius: 10px; background: #faf8f8; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #8a9e84; cursor: pointer; transition: all 0.15s; text-align: center; }
        .cf-type-btn:hover { border-color: #48A111; color: #48A111; }
        .cf-type-btn.active { background: #25671E; border-color: #25671E; color: #F7F0F0; }
        .cf-type-sub { font-size: 11px; font-weight: 400; opacity: 0.75; display: block; margin-top: 2px; }

        /* Price */
        .cf-price-wrap { display: flex; gap: 10px; align-items: center; }
        .cf-price-free-btn { padding: 11px 16px; border: 1.5px solid #e8dfdf; border-radius: 10px; background: #faf8f8; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #8a9e84; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .cf-price-free-btn.active { background: #edf7e6; border-color: #48A111; color: #48A111; }

        /* Stepper */
        .cf-stepper { display: flex; align-items: center; border: 1.5px solid #e8dfdf; border-radius: 10px; overflow: hidden; width: fit-content; }
        .cf-step-btn { width: 40px; height: 42px; background: #faf8f8; border: none; font-size: 18px; color: #48A111; cursor: pointer; transition: background 0.1s; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .cf-step-btn:hover { background: #edf7e6; }
        .cf-step-val { min-width: 72px; text-align: center; font-size: 15px; font-weight: 600; color: #1a2e14; border-left: 1.5px solid #e8dfdf; border-right: 1.5px solid #e8dfdf; padding: 0 8px; line-height: 42px; }

        /* Skeleton */
        .cf-skeleton { animation: pulse 1.5s ease infinite; display: flex; flex-direction: column; gap: 16px; }
        .cf-sk-header { height: 80px; background: #dde8d8; border-radius: 12px; }
        .cf-sk-card { height: 180px; background: #ede6e6; border-radius: 16px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }

        /* Success */
        .cf-success { text-align: center; padding: 48px 24px; background: #fff; border: 1.5px solid #e8dfdf; border-radius: 16px; }
        .cf-success-icon { font-size: 52px; margin-bottom: 16px; }
        .cf-success-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: #25671E; margin-bottom: 8px; }
        .cf-success-sub { font-size: 14px; color: #8a9e84; }

        /* Error state */
        .cf-fetch-error { text-align: center; padding: 64px 24px; border: 2px dashed #ddd5d5; border-radius: 16px; background: #fff; }
        .cf-fetch-error-icon { font-size: 48px; margin-bottom: 16px; }
        .cf-fetch-error-title { font-size: 18px; font-weight: 600; color: #25671E; margin-bottom: 8px; }
        .cf-fetch-error-sub { font-size: 14px; color: #a89f9f; }

        /* Submit bar */
        .cf-submit-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1.5px solid #e8dfdf; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; z-index: 100; box-shadow: 0 -4px 24px rgba(37,103,30,0.08); }
        .cf-submit-info { font-size: 13px; color: #8a9e84; }
        .cf-submit-info strong { color: #25671E; font-size: 15px; display: block; }

        .cf-submit-actions { display: flex; gap: 10px; align-items: center; }
        .cf-cancel-btn { padding: 12px 20px; background: transparent; border: 1.5px solid #e8dfdf; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #8a9e84; cursor: pointer; transition: all 0.15s; }
        .cf-cancel-btn:hover { border-color: #c4b8b8; color: #555; }
        .cf-submit-btn { padding: 12px 28px; background: #48A111; color: #F7F0F0; border: none; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.15s, transform 0.15s; display: inline-flex; align-items: center; gap: 8px; }
        .cf-submit-btn:hover:not(:disabled) { background: #25671E; transform: scale(1.02); }
        .cf-submit-btn:disabled { background: #e8dfdf; color: #b8afaf; cursor: not-allowed; }
        .cf-spinner { width: 15px; height: 15px; border: 2px solid rgba(247,240,240,0.4); border-top-color: #F7F0F0; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 540px) {
          .cf-row { grid-template-columns: 1fr; }
          .cf-card { padding: 20px 18px; }
          .cf-page { padding: 24px 16px 100px; }
          .cf-submit-bar { flex-direction: column; align-items: stretch; }
          .cf-submit-actions { justify-content: flex-end; }
        }
      `}</style>

      <div className="cf-page">
        <button className="cf-back" onClick={() => navigate(`/matches/${id}`)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver al partido
        </button>

        <h1 className="cf-heading">
          Editar
          <span>Partido</span>
        </h1>
        <p className="cf-subheading">Modifica los datos del partido. Los cambios se aplican al instante.</p>
        <div className="cf-match-id">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          Partido #{id}
        </div>

        {/* Error global de validación */}
        {errors._global && (
          <div className="cf-global-error">⚠ {errors._global[0]}</div>
        )}

        {/* Cargando */}
        {fetching && (
          <div className="cf-skeleton">
            <div className="cf-sk-header" />
            <div className="cf-sk-card" />
            <div className="cf-sk-card" />
          </div>
        )}

        {/* Error al cargar */}
        {!fetching && fetchError && (
          <div className="cf-fetch-error">
            <div className="cf-fetch-error-icon">⚠️</div>
            <div className="cf-fetch-error-title">No se pudo cargar el partido</div>
            <div className="cf-fetch-error-sub">{fetchError}</div>
          </div>
        )}

        {/* Success */}
        {!fetching && success && (
          <div className="cf-success">
            <div className="cf-success-icon">✅</div>
            <div className="cf-success-title">¡Partido actualizado!</div>
            <div className="cf-success-sub">Volviendo al detalle...</div>
          </div>
        )}

        {/* Formulario */}
        {!fetching && !fetchError && !success && form && (
          <form onSubmit={handleSubmit} noValidate>

            {/* ── TIPO DE PARTIDO ── */}
            <div className="cf-card">
              <div className="cf-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                Tipo de partido
              </div>

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
                    className={`cf-select${errors.required_level ? " has-error" : ""}`}
                    value={form.required_level}
                    onChange={(e) => set("required_level", e.target.value)}
                  >
                    {LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Máx. jugadores" error={errors.max_players?.[0]}>
                  <input
                    type="number" min={2} max={30}
                    className={`cf-input${errors.max_players ? " has-error" : ""}`}
                    value={form.max_players}
                    onChange={(e) => set("max_players", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* ── FECHA Y DURACIÓN ── */}
            <div className="cf-card">
              <div className="cf-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Fecha y duración
              </div>

              <Field label="Fecha y hora de inicio" error={errors.starts_at?.[0]}>
                <input
                  type="datetime-local"
                  className={`cf-input${errors.starts_at ? " has-error" : ""}`}
                  value={form.starts_at}
                  onChange={(e) => set("starts_at", e.target.value)}
                />
              </Field>

              <Field label="Duración" hint="en minutos">
                <div className="cf-stepper">
                  <button type="button" className="cf-step-btn"
                    onClick={() => set("duration", Math.max(30, form.duration - 15))}>−</button>
                  <span className="cf-step-val">{form.duration} min</span>
                  <button type="button" className="cf-step-btn"
                    onClick={() => set("duration", Math.min(180, form.duration + 15))}>+</button>
                </div>
              </Field>
            </div>

            {/* ── UBICACIÓN ── */}
            <div className="cf-card">
              <div className="cf-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Ubicación
              </div>

              <Field label="Nombre del campo" error={errors.location_name?.[0]}>
                <input
                  type="text" placeholder="Camp Municipal..."
                  className={`cf-input${errors.location_name ? " has-error" : ""}`}
                  value={form.location_name}
                  onChange={(e) => set("location_name", e.target.value)}
                />
              </Field>

              <div className="cf-row">
                <Field label="Dirección" error={errors.address?.[0]}>
                  <input
                    type="text" placeholder="Carrer Gran Via 1"
                    className={`cf-input${errors.address ? " has-error" : ""}`}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                  />
                </Field>
                <Field label="Ciudad" error={errors.city?.[0]}>
                  <input
                    type="text" placeholder="Barcelona"
                    className={`cf-input${errors.city ? " has-error" : ""}`}
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* ── PRECIO Y DESCRIPCIÓN ── */}
            <div className="cf-card">
              <div className="cf-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                Precio y descripción
              </div>

              <Field label="Precio por jugador" error={errors.price?.[0]}>
                <div className="cf-price-wrap">
                  <button
                    type="button"
                    className={`cf-price-free-btn${form.price === 0 ? " active" : ""}`}
                    onClick={() => set("price", form.price === 0 ? 5 : 0)}
                  >
                    {form.price === 0 ? "✓ Gratis" : "Gratis"}
                  </button>
                  <input
                    type="number" min={0} step={0.5} placeholder="5"
                    className={`cf-input${errors.price ? " has-error" : ""}`}
                    value={form.price === 0 ? "" : form.price}
                    disabled={form.price === 0}
                    style={{ opacity: form.price === 0 ? 0.4 : 1 }}
                    onChange={(e) => set("price", e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                  <span style={{ fontSize: 16, color: "#8a9e84", flexShrink: 0 }}>€</span>
                </div>
              </Field>

              <Field label="Descripción" hint="opcional" error={errors.description?.[0]}>
                <textarea
                  placeholder="Describe el partido, nivel esperado, normas..."
                  className={`cf-textarea${errors.description ? " has-error" : ""}`}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>

          </form>
        )}
      </div>

      {/* ── STICKY BAR ── */}
      {!fetching && !fetchError && !success && form && (
        <div className="cf-submit-bar">
          <div className="cf-submit-info">
            <strong>{form.match_type} · {form.city || "Sin ciudad"}</strong>
            {form.price === 0 ? "Gratis" : `${form.price}€/jugador`} · {form.duration} min
          </div>
          <div className="cf-submit-actions">
            <button className="cf-cancel-btn" onClick={() => navigate(`/matches/${id}`)}>
              Cancelar
            </button>
            <button className="cf-submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><div className="cf-spinner" /> Guardando...</>
                : "Guardar cambios →"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}