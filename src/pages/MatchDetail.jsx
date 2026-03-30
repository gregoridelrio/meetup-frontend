import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const POSITION_LABELS = {
  striker: "Delantero",
  midfielder: "Centrocampista",
  defender: "Defensa",
  goalkeeper: "Portero",
  winger: "Extremo",
};

const STATUS_MAP = {
  open: { label: "Abierto", color: "#48A111" },
  full: { label: "Completo", color: "#e05c2a" },
  cancelled: { label: "Cancelado", color: "#b0a0a0" },
  finished: { label: "Finalizado", color: "#b0a0a0" },
};

const formatDateTime = (str) => {
  const d = new Date(str);
  return {
    full: d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    day: d.getDate(),
    month: d.toLocaleDateString("es-ES", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase(),
  };
};

const formatRelative = (str) => {
  const diff = Date.now() - new Date(str);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins}m`;
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${days}d`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const BackButton = ({ onClick }) => (
  <button className="back-btn" onClick={onClick}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Volver a partidos
  </button>
);

const HeroSection = ({ match }) => {
  const dt = formatDateTime(match.starts_at);
  const status = STATUS_MAP[match.status] ?? STATUS_MAP.open;
  const price = parseFloat(match.price);

  return (
    <div className="hero">
      {/* Fondo decorativo */}
      <div className="hero-bg">
        <div className="hero-pitch-lines" aria-hidden="true">
          <div className="pitch-circle" />
          <div className="pitch-line-v" />
          <div className="pitch-arc" />
        </div>
      </div>

      <div className="hero-content">
        {/* Fecha grande */}
        <div className="hero-date-block">
          <span className="hero-weekday">{dt.weekday}</span>
          <span className="hero-day">{dt.day}</span>
          <span className="hero-month">{dt.month}</span>
        </div>

        <div className="hero-info">
          <div className="hero-top-row">
            <span className="hero-type-chip">{match.match_type}</span>
            <span className="hero-status-badge" style={{ "--sc": status.color }}>
              {status.label}
            </span>
          </div>
          <h1 className="hero-title">
            Fútbol {match.match_type}
            <span className="hero-city"> · {match.city}</span>
          </h1>
          <p className="hero-description">{match.description}</p>

          <div className="hero-pills">
            <span className="pill pill-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {dt.time} · {match.duration} min
            </span>
            <span className="pill pill-price">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              {price === 0 ? "Gratis" : `${price}€/persona`}
            </span>
            <span className="pill pill-level">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              {LEVEL_LABELS[match.required_level] ?? match.required_level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoGrid = ({ match }) => {
  const registrations = match.registrations?.length ?? 0;
  const spotsLeft = match.max_players - registrations;

  return (
    <div className="info-grid">
      <div className="info-card info-card--location">
        <div className="info-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
        </div>
        <div>
          <div className="info-label">Ubicación</div>
          <div className="info-value">{match.location_name}</div>
          <div className="info-sub">{match.address}, {match.city}</div>
        </div>
      </div>

      <div className="info-card info-card--players">
        <div className="info-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
        <div>
          <div className="info-label">Jugadores</div>
          <div className="info-value">{registrations} / {match.max_players}</div>
          <div className="info-sub">{spotsLeft > 0 ? `${spotsLeft} plazas libres` : "Sin plazas"}</div>
        </div>
        {/* Barra de progreso */}
        <div className="players-bar">
          <div
            className="players-bar-fill"
            style={{ width: `${Math.min((registrations / match.max_players) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const OrganizerCard = ({ organizer }) => (
  <div className="organizer-card">
    <div className="organizer-avatar-lg">
      {organizer.name[0].toUpperCase()}
    </div>
    <div className="organizer-body">
      <div className="organizer-header">
        <div>
          <div className="organizer-name">{organizer.name}</div>
          <div className="organizer-meta">
            {POSITION_LABELS[organizer.favourite_position] ?? organizer.favourite_position}
            {" · "}
            {LEVEL_LABELS[organizer.skill_level] ?? organizer.skill_level}
          </div>
        </div>
        <span className="rank-badge">{organizer.rank}</span>
      </div>
      <div className="organizer-stats">
        <div className="org-stat">
          <span className="org-stat-val">{organizer.activity_score}</span>
          <span className="org-stat-label">Actividad</span>
        </div>
      </div>
    </div>
  </div>
);

const CommentsSection = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <div className="comments-empty">
        <span>💬</span>
        <p>Nadie ha comentado aún. ¡Sé el primero!</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      {comments.map((c, i) => (
        <div key={c.id} className="comment-item" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="comment-avatar">#</div>
          <div className="comment-body">
            <div className="comment-content">{c.content}</div>
            <div className="comment-time">{formatRelative(c.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const JoinBar = ({ match }) => {
  const registrations = match.registrations?.length ?? 0;
  const isFull = match.status === "full" || registrations >= match.max_players;
  const isClosed = match.status === "cancelled" || match.status === "finished";
  const price = parseFloat(match.price);

  return (
    <div className="join-bar">
      <div className="join-bar-info">
        <span className="join-bar-price">{price === 0 ? "Gratis" : `${price}€`}</span>
        <span className="join-bar-spots">
          {isFull ? "Sin plazas disponibles" : isClosed ? "" : `${match.max_players - registrations} plazas libres`}
        </span>
      </div>
      <button
        className="join-bar-btn"
        disabled={isFull || isClosed}
      >
        {isFull ? "Partido completo"
          : isClosed ? (match.status === "cancelled" ? "Cancelado" : "Finalizado")
            : "Unirse al partido →"}
      </button>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const DetailSkeleton = () => (
  <div className="detail-skeleton">
    <div className="sk-hero" />
    <div className="sk-body">
      <div className="sk-line w60" />
      <div className="sk-line w40" />
      <div className="sk-line w80" />
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMatch(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #F7F0F0;
          color: #1a2e14;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          padding-bottom: 100px;
        }

        .detail-wrap {
          max-width: 780px;
          margin: 0 auto;
          padding: 32px 24px 40px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── BACK BUTTON ── */
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #6a7f64;
          cursor: pointer;
          padding: 0;
          margin-bottom: 28px;
          transition: color 0.15s;
        }
        .back-btn:hover { color: #25671E; }

        /* ── HERO ── */
        .hero {
          position: relative;
          background: #25671E;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 20px;
          min-height: 220px;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.08;
        }
        .pitch-circle {
          position: absolute;
          width: 260px; height: 260px;
          border: 3px solid #F7F0F0;
          border-radius: 50%;
          top: 50%; left: 60%;
          transform: translate(-50%, -50%);
        }
        .pitch-line-v {
          position: absolute;
          width: 3px; height: 200%;
          background: #F7F0F0;
          left: 60%; top: -50%;
        }
        .pitch-arc {
          position: absolute;
          width: 120px; height: 120px;
          border: 3px solid #F7F0F0;
          border-radius: 50%;
          bottom: -40px; left: -40px;
        }

        .hero-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 36px 36px;
        }

        /* Date block */
        .hero-date-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(247, 240, 240, 0.12);
          border: 1.5px solid rgba(247, 240, 240, 0.2);
          border-radius: 14px;
          padding: 16px 20px;
          flex-shrink: 0;
          gap: 0;
        }
        .hero-weekday {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #a8d88a;
        }
        .hero-day {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px;
          line-height: 1;
          color: #F7F0F0;
        }
        .hero-month {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #7ab55a;
        }

        /* Hero info */
        .hero-info { flex: 1; }
        .hero-top-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .hero-type-chip {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 4px;
          background: rgba(242, 181, 11, 0.2);
          color: #F2B50B;
          border: 1px solid rgba(242, 181, 11, 0.4);
        }
        .hero-status-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 3px 10px;
          border-radius: 20px;
          background: color-mix(in srgb, var(--sc) 20%, transparent);
          color: var(--sc);
          border: 1.5px solid color-mix(in srgb, var(--sc) 40%, transparent);
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(28px, 5vw, 44px);
          letter-spacing: 0.03em;
          color: #F7F0F0;
          line-height: 1.05;
          margin-bottom: 8px;
        }
        .hero-city {
          color: #7ab55a;
          font-size: 0.8em;
        }
        .hero-description {
          font-size: 14px;
          color: rgba(247, 240, 240, 0.65);
          line-height: 1.6;
          margin-bottom: 16px;
          font-style: italic;
        }
        .hero-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid rgba(247, 240, 240, 0.2);
          color: rgba(247, 240, 240, 0.85);
          background: rgba(247, 240, 240, 0.08);
        }
        .pill-price { color: #F2B50B; border-color: rgba(242,181,11,0.3); background: rgba(242,181,11,0.08); }

        /* ── INFO GRID ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }
        .info-card {
          background: #fff;
          border: 1.5px solid #e8dfdf;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .info-card:hover { border-color: #48A111; }
        .info-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: #edf7e6;
          color: #48A111;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .info-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a89f9f;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1a2e14;
        }
        .info-sub {
          font-size: 12px;
          color: #8a9e84;
          margin-top: 2px;
        }
        /* Players bar */
        .players-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 4px;
          background: #e8dfdf;
        }
        .players-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #48A111, #25671E);
          border-radius: 0 2px 2px 0;
          transition: width 0.8s ease;
        }

        /* ── SECTIONS ── */
        .section {
          background: #fff;
          border: 1.5px solid #e8dfdf;
          border-radius: 14px;
          padding: 22px 24px;
          margin-bottom: 14px;
          animation: slideUp 0.35s ease both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 0.06em;
          color: #25671E;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title-count {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          background: #edf7e6;
          color: #48A111;
          padding: 2px 8px;
          border-radius: 20px;
        }

        /* ── ORGANIZER CARD ── */
        .organizer-card {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .organizer-avatar-lg {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: #25671E;
          color: #F7F0F0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          flex-shrink: 0;
        }
        .organizer-body { flex: 1; }
        .organizer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .organizer-name {
          font-size: 17px;
          font-weight: 600;
          color: #1a2e14;
        }
        .organizer-meta {
          font-size: 13px;
          color: #8a9e84;
          margin-top: 2px;
        }
        .rank-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          background: #fff8e1;
          color: #c48a00;
          border: 1px solid #F2B50B;
          letter-spacing: 0.04em;
        }
        .organizer-stats { display: flex; gap: 20px; }
        .org-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f7f2f2;
          border-radius: 10px;
          padding: 8px 16px;
        }
        .org-stat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 24px;
          color: #25671E;
          line-height: 1;
        }
        .org-stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #a89f9f;
        }

        /* ── COMMENTS ── */
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .comment-item {
          display: flex;
          gap: 12px;
          animation: slideUp 0.3s ease both;
        }
        .comment-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #edf7e6;
          color: #48A111;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .comment-body {
          background: #f7f2f2;
          border-radius: 0 12px 12px 12px;
          padding: 10px 14px;
          flex: 1;
        }
        .comment-content {
          font-size: 14px;
          color: #1a2e14;
          line-height: 1.5;
        }
        .comment-time {
          font-size: 11px;
          color: #a89f9f;
          margin-top: 4px;
        }
        .comments-empty {
          text-align: center;
          padding: 28px;
          color: #a89f9f;
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .comments-empty span { font-size: 28px; }

        /* ── JOIN BAR (sticky) ── */
        .join-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #fff;
          border-top: 1.5px solid #e8dfdf;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          z-index: 100;
          box-shadow: 0 -4px 24px rgba(37, 103, 30, 0.08);
        }
        .join-bar-info { display: flex; flex-direction: column; }
        .join-bar-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 26px;
          color: #25671E;
          line-height: 1;
        }
        .join-bar-spots {
          font-size: 12px;
          color: #8a9e84;
        }
        .join-bar-btn {
          padding: 12px 28px;
          background: #48A111;
          color: #F7F0F0;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          white-space: nowrap;
        }
        .join-bar-btn:hover:not(:disabled) {
          background: #25671E;
          transform: scale(1.02);
        }
        .join-bar-btn:disabled {
          background: #e8dfdf;
          color: #b8afaf;
          cursor: not-allowed;
        }

        /* ── SKELETON ── */
        .detail-skeleton { animation: pulse 1.5s ease infinite; }
        .sk-hero {
          height: 220px;
          background: #dde8d8;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .sk-body { display: flex; flex-direction: column; gap: 12px; padding: 4px; }
        .sk-line {
          height: 14px;
          background: #ede6e6;
          border-radius: 6px;
        }
        .w60 { width: 60%; }
        .w40 { width: 40%; }
        .w80 { width: 80%; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.45; } }

        /* ── ERROR ── */
        .error-box {
          text-align: center;
          padding: 64px 24px;
          border: 2px dashed #ddd5d5;
          border-radius: 16px;
          background: #fff;
        }
        .error-icon { font-size: 48px; margin-bottom: 16px; }
        .error-title { font-size: 18px; font-weight: 600; color: #25671E; margin-bottom: 8px; }
        .error-sub { font-size: 14px; color: #a89f9f; }

        /* ── RESPONSIVE ── */
        @media (max-width: 580px) {
          .hero-content { flex-direction: column; align-items: flex-start; padding: 24px; gap: 20px; }
          .info-grid { grid-template-columns: 1fr; }
          .detail-wrap { padding: 20px 16px 40px; }
        }
      `}</style>

      <div className="detail-wrap">
        <BackButton onClick={() => navigate("/")} />

        {loading && <DetailSkeleton />}

        {!loading && error && (
          <div className="error-box">
            <div className="error-icon">⚠️</div>
            <div className="error-title">No se pudo cargar el partido</div>
            <div className="error-sub">Error: {error}</div>
          </div>
        )}

        {!loading && !error && match && (
          <>
            <HeroSection match={match} />

            <InfoGrid match={match} />

            {/* Organizador */}
            <div className="section" style={{ animationDelay: "60ms" }}>
              <div className="section-title">Organizador</div>
              <OrganizerCard organizer={match.organizer} />
            </div>

            {/* Comentarios */}
            <div className="section" style={{ animationDelay: "120ms" }}>
              <div className="section-title">
                Comentarios
                <span className="section-title-count">{match.comments?.length ?? 0}</span>
              </div>
              <CommentsSection comments={match.comments} />
            </div>
          </>
        )}
      </div>

      {/* Sticky join bar */}
      {!loading && !error && match && <JoinBar match={match} />}
    </>
  );
}