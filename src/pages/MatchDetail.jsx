import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";

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

const BackButton = ({ onClick }) => (
  <button className="back-btn" onClick={onClick}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Volver a partidos
  </button>
);

const HeroSection = ({ match, isOrganizer, onEdit }) => {
  const dt = formatDateTime(match.starts_at);
  const status = STATUS_MAP[match.status] ?? STATUS_MAP.open;
  const price = parseFloat(match.price);

  return (
    <div className="hero">
      <div className="hero-bg">
        <div className="hero-pitch-lines" aria-hidden="true">
          <div className="pitch-circle" />
          <div className="pitch-line-v" />
          <div className="pitch-arc" />
        </div>
      </div>
      <div className="hero-content">
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
            {isOrganizer && (
              <button className="hero-edit-btn" onClick={onEdit}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar partido
              </button>
            )}
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

const InfoGrid = ({ match, registrationCount = 0 }) => {
  const spotsLeft = match.max_players - registrationCount;
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
          <div className="info-value">{registrationCount} / {match.max_players}</div>
          <div className="info-sub">{spotsLeft > 0 ? `${spotsLeft} plazas libres` : "Sin plazas"}</div>
        </div>
        <div className="players-bar">
          <div className="players-bar-fill" style={{ width: `${Math.min((registrationCount / match.max_players) * 100, 100)}%` }} />
        </div>
      </div>
    </div>
  );
};

const OrganizerCard = ({ organizer }) => (
  <div className="organizer-card">
    <div className="organizer-avatar-lg">{organizer.name[0].toUpperCase()}</div>
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

const JoinBar = ({ match, registrationCount, isJoined, onJoin, onLeave, joining }) => {
  const isFull = match.status === "full" || registrationCount >= match.max_players;
  const isClosed = match.status === "cancelled" || match.status === "finished";
  const price = parseFloat(match.price);
  const spotsLeft = match.max_players - registrationCount;

  const getLabel = () => {
    if (joining) return <><div className="btn-spinner" />Procesando...</>;
    if (isClosed) return match.status === "cancelled" ? "Cancelado" : "Finalizado";
    if (isJoined) return "Abandonar partido";
    if (isFull) return "Partido completo";
    return "Unirse al partido →";
  };

  return (
    <div className="join-bar">
      <div className="join-bar-info">
        <span className="join-bar-price">{price === 0 ? "Gratis" : `${price}€`}</span>
        <span className="join-bar-spots">
          {isClosed ? ""
            : isFull && !isJoined ? "Sin plazas disponibles"
              : isJoined ? "Ya estás apuntado"
                : `${spotsLeft} plaza${spotsLeft !== 1 ? "s" : ""} libre${spotsLeft !== 1 ? "s" : ""}`}
        </span>
      </div>
      <button
        className={`join-bar-btn${isJoined ? " join-bar-btn--leave" : ""}`}
        disabled={(!isJoined && (isFull || isClosed)) || joining}
        onClick={() => isJoined ? onLeave() : onJoin()}
      >
        {getLabel()}
      </button>
    </div>
  );
};

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

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // ✅ FIX: añadido `user` al destructuring
  const { isAuth, token, user } = useAuth();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState(null);

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMatch(data);
        setRegistrationCount(data.registrations?.length ?? 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const showFeedback = (type, msg) => {
    setJoinFeedback({ type, msg });
    setTimeout(() => setJoinFeedback(null), 3500);
  };

  const handleJoin = useCallback(async () => {
    if (!isAuth) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${id}/players`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al unirse");
      setIsJoined(true);
      setRegistrationCount((c) => c + 1);
      showFeedback("success", "¡Te has unido al partido!");
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setJoining(false);
    }
  }, [isAuth, token, id, location.pathname, navigate]);

  const handleLeave = useCallback(async () => {
    setJoining(true);
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${id}/players`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al abandonar");
      setIsJoined(false);
      setRegistrationCount((c) => Math.max(0, c - 1));
      showFeedback("success", "Has abandonado el partido.");
    } catch (err) {
      showFeedback("error", err.message);
    } finally {
      setJoining(false);
    }
  }, [token, id]);

  const isOrganizer = !!user && match?.organizer?.id === user.id;

  return (
    <>
      <style>{`/* ... tu CSS aquí sin cambios ... */`}</style>

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
            <HeroSection
              match={match}
              isOrganizer={isOrganizer}
              onEdit={() => navigate(`/matches/${id}/edit`)}
            />
            <InfoGrid match={match} registrationCount={registrationCount} />
            <div className="section" style={{ animationDelay: "60ms" }}>
              <div className="section-title">Organizador</div>
              <OrganizerCard organizer={match.organizer} />
            </div>
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

      {joinFeedback && (
        <div className={`join-toast join-toast--${joinFeedback.type}`}>
          {joinFeedback.type === "success" ? "✓" : "⚠"} {joinFeedback.msg}
        </div>
      )}

      {!loading && !error && match && (
        <JoinBar
          match={match}
          registrationCount={registrationCount}
          isJoined={isJoined}
          onJoin={handleJoin}
          onLeave={handleLeave}
          joining={joining}
        />
      )}
    </>
  );
}