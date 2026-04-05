import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MatchesIndex.module.css";

const API_BASE_URL = "/api";

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

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase(),
    time: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    weekday: date.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase(),
  };
};

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonDate} />
    <div className={styles.skeletonBody}>
      <div className={`${styles.skeletonLine} ${styles.wide}`} />
      <div className={`${styles.skeletonLine} ${styles.medium}`} />
      <div className={`${styles.skeletonLine} ${styles.short}`} />
    </div>
    <div className={styles.skeletonFooter} />
  </div>
);

const MatchCard = ({ match, index }) => {
  const navigate = useNavigate();
  const formatted = formatDate(match.starts_at);
  const statusColor = STATUS_COLORS[match.status] ?? "#22c55e";
  const price = parseFloat(match.price);
  const isFull = match.status === "full";
  const isClosed = match.status === "cancelled" || match.status === "finished";

  return (
    <article
      className={styles.matchCard}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => navigate(`/matches/${match.id}`)}
    >
      <div className={styles.dateBand}>
        <span className={styles.dateDay}>{formatted.weekday}</span>
        <span className={styles.dateNumber}>{formatted.day}</span>
        <span className={styles.dateMonth}>{formatted.month}</span>
        <span className={styles.dateTime}>{formatted.time}</span>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.titleRow}>
            <h3 className={styles.matchTitle}>{match.match_type} · {match.city}</h3>
            <span className={styles.matchTypeChip}>{match.match_type}</span>
          </div>
          <span
            className={styles.spotBadge}
            style={{ "--badge-color": statusColor }}
          >
            {match.status === "open" ? "Abierto"
              : match.status === "full" ? "Completo"
                : match.status === "cancelled" ? "Cancelado"
                  : "Finalizado"}
          </span>
        </div>

        <div className={styles.cardMeta}>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {match.location_name} — {match.address}
          </span>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {match.duration} min
          </span>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {LEVEL_LABELS[match.required_level] ?? match.required_level}
          </span>
          <span className={styles.metaItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {price === 0 ? "Gratis" : `${price}€`}
          </span>
        </div>

        {match.description && (
          <p className={styles.matchDescription}>{match.description}</p>
        )}

        <div className={styles.cardFooter}>
          {match.organizer && (
            <div className={styles.organizer}>
              <div className={styles.organizerAvatar}>
                {match.organizer.name[0].toUpperCase()}
              </div>
              <span>{match.organizer.name}</span>
              {match.organizer.rank && (
                <span className={styles.organizerRank}>{match.organizer.rank}</span>
              )}
            </div>
          )}
          <button
            className={styles.joinBtn}
            disabled={isFull || isClosed}
            onClick={(e) => { e.stopPropagation(); navigate(`/matches/${match.id}`); }}
          >
            {isFull ? "Sin plazas" : isClosed ? "Cerrado" : "Unirse →"}
          </button>
        </div>
      </div>
    </article>
  );
};

const FilterBar = ({ filter, setFilter, total }) => (
  <div className={styles.filterBar}>
    <div className={styles.filterTabs}>
      {["todos", "hoy", "esta semana"].map((f) => (
        <button
          key={f}
          className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
          onClick={() => setFilter(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
    <span className={styles.totalCount}>{total} partidos</span>
  </div>
);

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
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowText}>Partidos disponibles</span>
        </div>
        <h1 className={styles.title}>
          Próximos
          <span className={styles.titleAccent}>Partidos</span>
        </h1>
        <p className={styles.subtitle}>
          Únete a un partido cerca de ti o crea el tuyo propio.
          Jugadores de todos los niveles son bienvenidos.
        </p>
      </header>

      <FilterBar filter={filter} setFilter={setFilter} total={filteredMatches.length} />

      <div className={styles.matchesList}>
        {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && error && (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>⚠️</div>
            <div className={styles.stateTitle}>No se pudo cargar los partidos</div>
            <div className={styles.stateSub}>Error: {error}</div>
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filteredMatches.length === 0 && (
          <div className={styles.stateBox}>
            <div className={styles.stateIcon}>🏟️</div>
            <div className={styles.stateTitle}>No hay partidos para este filtro</div>
            <div className={styles.stateSub}>Prueba otro filtro o vuelve más tarde.</div>
          </div>
        )}

        {!loading && !error && filteredMatches.map((match, i) => (
          <MatchCard key={match.id ?? i} match={match} index={i} />
        ))}
      </div>
    </div>
  );
}