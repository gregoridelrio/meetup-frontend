import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";

const LEVEL_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const STATUS_MAP = {
  open: { label: "Abierto", color: "#48A111" },
  full: { label: "Completo", color: "#e05c2a" },
  cancelled: { label: "Cancelado", color: "#b0a0a0" },
  finished: { label: "Finalizado", color: "#b0a0a0" },
};

const formatDate = (str) => {
  const d = new Date(str);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("es-ES", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase(),
    time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
};

export default function MyMatches() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/users/matches`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRegistrations(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMatches();
  }, [token]);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/stats`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStats(data);
      } catch {
        // silencioso
      }
    };
    fetchStats();
  }, [token]);

  return (

    <div className="my-matches-page">
      <div className="my-matches-header">
        {stats && (
          <div className="user-stats-bar">
            <div className="user-stat">
              <span className="user-stat-val">{stats.matches_organized}</span>
              <span className="user-stat-label">Organizados</span>
            </div>
            <div className="user-stat">
              <span className="user-stat-val">{stats.matches_joined}</span>
              <span className="user-stat-label">Apuntado</span>
            </div>
            <div className="user-stat">
              <span className="user-stat-val">{stats.total_comments}</span>
              <span className="user-stat-label">Comentarios</span>
            </div>
            <div className="user-stat">
              <span className="user-stat-val">{stats.activity_score}</span>
              <span className="user-stat-label">Puntuación</span>
            </div>
            <div className="user-stat">
              <span className="user-stat-val">{stats.rank}</span>
              <span className="user-stat-label">Rango</span>
            </div>
          </div>
        )}
        <h1 className="my-matches-title">Mis Partidos</h1>
        <p className="my-matches-sub">Partidos en los que estás apuntado.</p>
      </div>

      {loading && <p>Cargando partidos...</p>}

      {!loading && error && (
        <div className="my-matches-error">
          <span>⚠️</span>
          <p>No se pudieron cargar tus partidos: {error}</p>
        </div>
      )}

      {!loading && !error && registrations.length === 0 && (
        <div className="my-matches-empty">
          <span>🏟️</span>
          <p>No estás apuntado a ningún partido todavía.</p>
          <button onClick={() => navigate("/")}>Ver partidos disponibles →</button>
        </div>
      )}

      {!loading && !error && registrations.length > 0 && (
        <div className="matches-list">
          {registrations.map((reg) => {
            const match = reg.match;
            const dt = formatDate(match.starts_at);
            const status = STATUS_MAP[match.status] ?? STATUS_MAP.open;
            const price = parseFloat(match.price);

            return (
              <article
                key={reg.id}
                className="match-card"
                onClick={() => navigate(`/matches/${match.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-date-band">
                  <span className="date-day">{dt.weekday}</span>
                  <span className="date-number">{dt.day}</span>
                  <span className="date-month">{dt.month}</span>
                  <span className="date-time">{dt.time}</span>
                </div>

                <div className="card-content">
                  <div className="card-header">
                    <div className="title-row">
                      <h3 className="match-title">{match.match_type} · {match.city}</h3>
                      <span className="match-type-chip">{match.match_type}</span>
                    </div>
                    <span
                      className="spot-badge"
                      style={{ "--badge-color": status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="card-meta">
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
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
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {LEVEL_LABELS[match.required_level] ?? match.required_level}
                    </span>
                    <span className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      {price === 0 ? "Gratis" : `${price}€`}
                    </span>
                  </div>

                  <div className="card-footer">
                    <span className="registration-date">
                      Apuntado el {new Date(reg.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}