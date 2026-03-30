import { useState, useEffect } from "react";

const API_BASE_URL = "/api"; // Proxy Vite → Laravel localhost:8000

// --- Utilidades ---
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase(),
    date: date.getDate(),
    month: date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase(),
    time: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
};

const getSpotStatus = () => { }; // ya no se usa, se mantiene por compatibilidad

// --- Skeleton Loader ---
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-date" />
    <div className="skeleton-body">
      <div className="skeleton-line wide" />
      <div className="skeleton-line medium" />
      <div className="skeleton-line short" />
    </div>
    <div className="skeleton-footer" />
  </div>
);

// Etiquetas de nivel y tipo de partido
const LEVEL_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const STATUS_COLORS = {
  open: "#48A111",
  full: "#e05c2a",
  cancelled: "#b0a0a0",
  finished: "#b0a0a0",
};

// --- Tarjeta de partido ---
const MatchCard = ({ match, index }) => {
  const formatted = formatDate(match.starts_at);
  const isFull = match.status === "full";
  const isClosed = match.status === "cancelled" || match.status === "finished";
  const price = parseFloat(match.price);
  const statusColor = STATUS_COLORS[match.status] ?? "#22c55e";

  return (
    <article
      className="match-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Banda lateral de fecha */}
      <div className="card-date-band">
        <span className="date-day">{formatted.day}</span>
        <span className="date-number">{formatted.date}</span>
        <span className="date-month">{formatted.month}</span>
        <span className="date-time">{formatted.time}</span>
      </div>

      {/* Contenido principal */}
      <div className="card-content">
        <div className="card-header">
          <div className="title-row">
            <h3 className="match-title">{match.match_type} · {match.city}</h3>
            <span className="match-type-chip">{match.match_type}</span>
          </div>
          <span className="spot-badge" style={{ "--badge-color": statusColor }}>
            {match.status === "open" ? "Abierto"
              : match.status === "full" ? "Completo"
                : match.status === "cancelled" ? "Cancelado"
                  : "Finalizado"}
          </span>
        </div>

        <div className="card-meta">
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {match.location_name} — {match.address}
          </span>
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {match.duration} min
          </span>
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Máx. {match.max_players} jugadores
          </span>
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {LEVEL_LABELS[match.required_level] ?? match.required_level}
          </span>
          <span className="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {price === 0 ? "Gratis" : `${price}€`}
          </span>
        </div>

        {match.description && (
          <p className="match-description">{match.description}</p>
        )}

        <div className="card-footer">
          {match.organizer && (
            <div className="organizer">
              <div className="organizer-avatar">
                {match.organizer.name[0].toUpperCase()}
              </div>
              <span>{match.organizer.name}</span>
              {match.organizer.rank && (
                <span className="organizer-rank">{match.organizer.rank}</span>
              )}
            </div>
          )}
          <button className="join-btn" disabled={isFull || isClosed}>
            {isFull ? "Sin plazas" : isClosed ? match.status === "cancelled" ? "Cancelado" : "Finalizado" : "Unirse →"}
          </button>
        </div>
      </div>
    </article>
  );
};

// --- Filtros ---
const FilterBar = ({ filter, setFilter, total }) => (
  <div className="filter-bar">
    <div className="filter-tabs">
      {["todos", "hoy", "esta semana"].map((f) => (
        <button
          key={f}
          className={`filter-tab ${filter === f ? "active" : ""}`}
          onClick={() => setFilter(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
    <span className="total-count">{total} partidos</span>
  </div>
);

// --- Vista principal ---
export default function MatchesIndex() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/matches`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Soporta tanto { data: [...] } como [...]
        setMatches(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (filter === "todos") return true;
    const d = new Date(m.starts_at);
    const now = new Date();
    if (filter === "hoy") return d.toDateString() === now.toDateString();
    if (filter === "esta semana") {
      const weekAhead = new Date(now);
      weekAhead.setDate(now.getDate() + 7);
      return d >= now && d <= weekAhead;
    }
    return true;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        /* ── PALETTE ──────────────────────────────────────────
           #25671E  verde oscuro  → fondos de acento, date band
           #48A111  verde vivo    → CTA principal, highlights
           #F2B50B  amarillo      → badges, rank, acento cálido
           #F7F0F0  blanco cálido → fondo general, texto sobre verde
        ─────────────────────────────────────────────────────── */

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #F7F0F0;
          color: #1a2e14;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .app {
          max-width: 860px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        /* HEADER */
        .page-header {
          margin-bottom: 40px;
        }
        .header-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .pitch-icon {
          width: 32px; height: 32px;
          background: #48A111;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .eyebrow-text {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #48A111;
        }
        .page-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 8vw, 80px);
          line-height: 0.92;
          letter-spacing: 0.02em;
          color: #25671E;
        }
        .page-title span {
          color: #48A111;
          display: block;
        }
        .page-subtitle {
          margin-top: 16px;
          color: #6a7f64;
          font-size: 15px;
          max-width: 420px;
          line-height: 1.6;
        }

        /* FILTER BAR */
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
        }
        .filter-tabs {
          display: flex;
          gap: 4px;
          background: #ede6e6;
          border: 1px solid #ddd5d5;
          border-radius: 10px;
          padding: 4px;
        }
        .filter-tab {
          padding: 7px 16px;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: #8a7f7f;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-tab:hover { color: #25671E; }
        .filter-tab.active {
          background: #25671E;
          color: #F7F0F0;
          font-weight: 600;
        }
        .total-count {
          font-size: 13px;
          color: #a89f9f;
          white-space: nowrap;
        }

        /* MATCH CARDS */
        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .match-card {
          display: flex;
          background: #fff;
          border: 1.5px solid #e8dfdf;
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          animation: slideUp 0.35s ease both;
        }
        .match-card:hover {
          border-color: #48A111;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(72, 161, 17, 0.1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* DATE BAND */
        .card-date-band {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 18px;
          background: #25671E;
          border-right: none;
          min-width: 72px;
          gap: 2px;
        }
        .date-day {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #a8d88a;
        }
        .date-number {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 40px;
          line-height: 1;
          color: #F7F0F0;
        }
        .date-month {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #7ab55a;
        }
        .date-time {
          margin-top: 8px;
          font-size: 11px;
          color: #F2B50B;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        /* CARD BODY */
        .card-content {
          flex: 1;
          padding: 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .match-title {
          font-size: 17px;
          font-weight: 600;
          color: #1a2e14;
          line-height: 1.3;
        }
        .match-type-chip {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 2px 8px;
          border-radius: 4px;
          background: #edf7e6;
          color: #48A111;
          border: 1px solid #c8e8b0;
          text-transform: uppercase;
        }
        .spot-badge {
          white-space: nowrap;
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 20px;
          background: color-mix(in srgb, var(--badge-color) 12%, transparent);
          color: var(--badge-color);
          border: 1.5px solid color-mix(in srgb, var(--badge-color) 35%, transparent);
        }
        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #8a9e84;
        }
        .meta-item svg { flex-shrink: 0; color: #48A111; }
        .match-description {
          font-size: 13px;
          color: #7a8f74;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }
        .organizer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #8a9e84;
        }
        .organizer-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #25671E;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #F7F0F0;
        }
        .organizer-rank {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 20px;
          background: #fff8e1;
          color: #c48a00;
          border: 1px solid #F2B50B;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .join-btn {
          padding: 8px 20px;
          background: #48A111;
          color: #F7F0F0;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }
        .join-btn:hover:not(:disabled) {
          background: #25671E;
          transform: scale(1.03);
        }
        .join-btn:disabled {
          background: #e8dfdf;
          color: #b8afaf;
          cursor: not-allowed;
        }

        /* SKELETON */
        .skeleton-card {
          display: flex;
          background: #fff;
          border: 1.5px solid #e8dfdf;
          border-radius: 14px;
          overflow: hidden;
          height: 110px;
          animation: pulse 1.5s ease infinite;
        }
        .skeleton-date { width: 72px; background: #dde8d8; flex-shrink: 0; }
        .skeleton-body { flex: 1; padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
        .skeleton-footer { width: 100px; background: #f0ebe8; flex-shrink: 0; }
        .skeleton-line {
          height: 12px;
          background: #ede6e6;
          border-radius: 6px;
        }
        .skeleton-line.wide { width: 60%; }
        .skeleton-line.medium { width: 40%; }
        .skeleton-line.short { width: 25%; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        /* ERROR & EMPTY */
        .state-box {
          text-align: center;
          padding: 64px 24px;
          border: 2px dashed #ddd5d5;
          border-radius: 16px;
          background: #fff;
        }
        .state-icon { font-size: 48px; margin-bottom: 16px; }
        .state-title { font-size: 18px; font-weight: 600; color: #25671E; margin-bottom: 8px; }
        .state-sub { font-size: 14px; color: #a89f9f; }
        .retry-btn {
          margin-top: 20px;
          padding: 10px 24px;
          background: transparent;
          border: 1.5px solid #ddd5d5;
          border-radius: 8px;
          color: #8a7f7f;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .retry-btn:hover { border-color: #48A111; color: #48A111; }

        /* RESPONSIVE */
        @media (max-width: 540px) {
          .card-date-band { padding: 16px 12px; min-width: 58px; }
          .date-number { font-size: 30px; }
          .card-content { padding: 14px 16px; }
          .filter-bar { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="app">
        {/* Cabecera */}
        <header className="page-header">
          <div className="header-eyebrow">
            <div className="pitch-icon">⚽</div>
            <span className="eyebrow-text">Partidos disponibles</span>
          </div>
          <h1 className="page-title">
            Próximos
            <span>Partidos</span>
          </h1>
          <p className="page-subtitle">
            Únete a un partido cerca de ti o crea el tuyo propio.
            Jugadores de todos los niveles son bienvenidos.
          </p>
        </header>

        {/* Filtros */}
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          total={filteredMatches.length}
        />

        {/* Lista de partidos */}
        <div className="matches-list">
          {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && error && (
            <div className="state-box">
              <div className="state-icon">⚠️</div>
              <div className="state-title">No se pudo cargar los partidos</div>
              <div className="state-sub">Error: {error}</div>
              <button className="retry-btn" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && filteredMatches.length === 0 && (
            <div className="state-box">
              <div className="state-icon">🏟️</div>
              <div className="state-title">No hay partidos para este filtro</div>
              <div className="state-sub">Prueba otro filtro o vuelve más tarde.</div>
            </div>
          )}

          {!loading &&
            !error &&
            filteredMatches.map((match, i) => (
              <MatchCard key={match.id ?? i} match={match} index={i} />
            ))}
        </div>
      </div>
    </>
  );
}