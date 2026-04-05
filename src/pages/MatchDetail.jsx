import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./MatchDetail.module.css";

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
  <button className={styles.backBtn} onClick={onClick}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Volver a partidos
  </button>
);

const HeroSection = ({ match, isOrganizer, isAdmin, onEdit, onDelete }) => {
  const dt = formatDateTime(match.starts_at);
  const status = STATUS_MAP[match.status] ?? STATUS_MAP.open;
  const price = parseFloat(match.price);
  const canEdit = isOrganizer || isAdmin;

  return (
    <div className={styles.hero}>
      <div className={styles.heroBg} aria-hidden="true">
        <div className={styles.pitchCircle} />
        <div className={styles.pitchLineV} />
        <div className={styles.pitchArc} />
      </div>
      <div className={styles.heroContent}>
        <div className={styles.heroDateBlock}>
          <span className={styles.heroWeekday}>{dt.weekday}</span>
          <span className={styles.heroDay}>{dt.day}</span>
          <span className={styles.heroMonth}>{dt.month}</span>
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.heroTopRow}>
            <span className={styles.heroTypeChip}>{match.match_type}</span>
            <span className={styles.heroStatusBadge} style={{ "--sc": status.color }}>
              {status.label}
            </span>
            {canEdit && (
              <button className={styles.heroEditBtn} onClick={onEdit}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar partido
              </button>
            )}
            {isAdmin && (
              <button className={styles.heroDeleteBtn} onClick={onDelete}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                Eliminar
              </button>
            )}
          </div>
          <h1 className={styles.heroTitle}>
            Fútbol {match.match_type}
            <span className={styles.heroCity}> · {match.city}</span>
          </h1>
          <p className={styles.heroDescription}>{match.description}</p>
          <div className={styles.heroPills}>
            <span className={styles.pill}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {dt.time} · {match.duration} min
            </span>
            <span className={`${styles.pill} ${styles.pillPrice}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              {price === 0 ? "Gratis" : `${price}€/persona`}
            </span>
            <span className={styles.pill}>
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
    <div className={styles.infoGrid}>
      <div className={styles.infoCard}>
        <div className={styles.infoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
        </div>
        <div>
          <div className={styles.infoLabel}>Ubicación</div>
          <div className={styles.infoValue}>{match.location_name}</div>
          <div className={styles.infoSub}>{match.address}, {match.city}</div>
        </div>
      </div>
      <div className={styles.infoCard}>
        <div className={styles.infoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
        <div>
          <div className={styles.infoLabel}>Jugadores</div>
          <div className={styles.infoValue}>{registrationCount} / {match.max_players}</div>
          <div className={styles.infoSub}>{spotsLeft > 0 ? `${spotsLeft} plazas libres` : "Sin plazas"}</div>
        </div>
        <div className={styles.playersBar}>
          <div className={styles.playersBarFill} style={{ width: `${Math.min((registrationCount / match.max_players) * 100, 100)}%` }} />
        </div>
      </div>
    </div>
  );
};

const OrganizerCard = ({ organizer }) => (
  <div className={styles.organizerCard}>
    <div className={styles.organizerAvatarLg}>{organizer.name[0].toUpperCase()}</div>
    <div className={styles.organizerBody}>
      <div className={styles.organizerHeader}>
        <div>
          <div className={styles.organizerName}>{organizer.name}</div>
          <div className={styles.organizerMeta}>
            {POSITION_LABELS[organizer.favourite_position] ?? organizer.favourite_position}
            {" · "}
            {LEVEL_LABELS[organizer.skill_level] ?? organizer.skill_level}
          </div>
        </div>
        <span className={styles.rankBadge}>{organizer.rank}</span>
      </div>
      <div className={styles.organizerStats}>
        <div className={styles.orgStat}>
          <span className={styles.orgStatVal}>{organizer.activity_score}</span>
          <span className={styles.orgStatLabel}>Actividad</span>
        </div>
      </div>
    </div>
  </div>
);

const CommentsSection = ({ matchId, isAuth, token, user }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/matches/${matchId}/comments`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setComments(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [matchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Error al comentar");
      const newComment = {
        ...data.comment,
        user: {
          id: user.id,
          name: user.name,
          skill_level: user.skill_level,
          rank: user.rank,
          favourite_position: user.favourite_position,
          activity_score: user.activity_score,
          role: user.role,
        },
      };
      setComments((prev) => [...prev, newComment]);
      setContent("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Cargando comentarios...</p>;

  return (
    <div>
      {comments.length === 0 ? (
        <div className={styles.commentsEmpty}>
          <span>💬</span>
          <p>Nadie ha comentado aún. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className={styles.commentsList}>
          {comments.map((c, i) => (
            <div key={c.id} className={styles.commentItem} style={{ animationDelay: `${i * 50}ms` }}>
              <div className={styles.commentAvatar}>
                {c.user?.name?.[0]?.toUpperCase() ?? "#"}
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <strong className={styles.commentAuthor}>{c.user?.name}</strong>
                  <span className={styles.commentSkill}>
                    {LEVEL_LABELS[c.user?.skill_level] ?? c.user?.skill_level}
                  </span>
                  <span className={styles.commentRank}>{c.user?.rank}</span>
                </div>
                <div className={styles.commentContent}>{c.content}</div>
                <div className={styles.commentTime}>{formatRelative(c.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isAuth && (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <input
            type="text"
            className={styles.commentInput}
            placeholder="Escribe un comentario..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={sending}
          />
          <button className={styles.commentSubmit} type="submit" disabled={sending || !content.trim()}>
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </form>
      )}
    </div>
  );
};

const PlayersList = ({ matchId, token }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/matches/${matchId}/players`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPlayers(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        console.error("Error cargando jugadores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [matchId, token]);

  if (loading) return <p>Cargando jugadores...</p>;

  if (players.length === 0) return (
    <div className={styles.playersEmpty}>
      <span>👥</span>
      <p>Aún no hay jugadores apuntados.</p>
    </div>
  );

  return (
    <div className={styles.playersList}>
      {players.map((reg) => (
        <div key={reg.id} className={styles.playerItem}>
          <div className={styles.playerAvatar}>
            {reg.user.name[0].toUpperCase()}
          </div>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>{reg.user.name}</span>
            <span className={styles.playerMeta}>
              {LEVEL_LABELS[reg.user.skill_level] ?? reg.user.skill_level}
              {" · "}
              {POSITION_LABELS[reg.user.favourite_position] ?? reg.user.favourite_position}
            </span>
          </div>
          <span className={styles.playerRank}>{reg.user.rank}</span>
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
    if (joining) return <><div className={styles.btnSpinner} />Procesando...</>;
    if (isClosed) return match.status === "cancelled" ? "Cancelado" : "Finalizado";
    if (isJoined) return "Abandonar partido";
    if (isFull) return "Partido completo";
    return "Unirse al partido →";
  };

  return (
    <div className={styles.joinBar}>
      <div className={styles.joinBarInfo}>
        <span className={styles.joinBarPrice}>{price === 0 ? "Gratis" : `${price}€`}</span>
        <span className={styles.joinBarSpots}>
          {isClosed ? ""
            : isFull && !isJoined ? "Sin plazas disponibles"
              : isJoined ? "Ya estás apuntado"
                : `${spotsLeft} plaza${spotsLeft !== 1 ? "s" : ""} libre${spotsLeft !== 1 ? "s" : ""}`}
        </span>
      </div>
      <button
        className={`${styles.joinBarBtn} ${isJoined ? styles.joinBarBtnLeave : ""}`}
        disabled={(!isJoined && (isFull || isClosed)) || joining}
        onClick={() => isJoined ? onLeave() : onJoin()}
      >
        {getLabel()}
      </button>
    </div>
  );
};

const DetailSkeleton = () => (
  <div className={styles.detailSkeleton}>
    <div className={styles.skHero} />
    <div className={styles.skBody}>
      <div className={`${styles.skLine} ${styles.w60}`} />
      <div className={`${styles.skLine} ${styles.w40}`} />
      <div className={`${styles.skLine} ${styles.w80}`} />
    </div>
  </div>
);

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleDelete = useCallback(async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este partido?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Error al eliminar");
      navigate("/");
    } catch (err) {
      showFeedback("error", err.message);
    }
  }, [token, id, navigate]);

  const isOrganizer = !!user && match?.organizer?.id === user.id;
  const isAdmin = user?.role === "admin";

  return (
    <>
      <div className={styles.detailWrap}>
        <BackButton onClick={() => navigate("/")} />

        {loading && <DetailSkeleton />}

        {!loading && error && (
          <div className={styles.errorBox}>
            <div className={styles.errorIcon}>⚠️</div>
            <div className={styles.errorTitle}>No se pudo cargar el partido</div>
            <div className={styles.errorSub}>Error: {error}</div>
          </div>
        )}

        {!loading && !error && match && (
          <>
            <HeroSection
              match={match}
              isOrganizer={isOrganizer}
              isAdmin={isAdmin}
              onEdit={() => navigate(`/matches/${id}/edit`)}
              onDelete={handleDelete}
            />
            <InfoGrid match={match} registrationCount={registrationCount} />
            <div className={styles.section} style={{ animationDelay: "60ms" }}>
              <div className={styles.sectionTitle}>Jugadores</div>
              <PlayersList matchId={id} token={token} />
            </div>
            <div className={styles.section} style={{ animationDelay: "80ms" }}>
              <div className={styles.sectionTitle}>Organizador</div>
              <OrganizerCard organizer={match.organizer} />
            </div>
            <div className={styles.section} style={{ animationDelay: "100ms" }}>
              <div className={styles.sectionTitle}>Comentarios</div>
              <CommentsSection
                matchId={id}
                isAuth={isAuth}
                token={token}
                user={user}
              />
            </div>
          </>
        )}
      </div>

      {joinFeedback && (
        <div className={`${styles.joinToast} ${joinFeedback.type === "success" ? styles.joinToastSuccess : styles.joinToastError}`}>
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