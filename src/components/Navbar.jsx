import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Cierra el menú al navegar
  const handleNav = (to) => {
    setOpen(false);
    navigate(to);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  // Cierra el menú si se hace clic fuera
  const handleOverlayClick = () => setOpen(false);

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo} onClick={() => setOpen(false)}>
          <span className={styles.logoName}>Meetup Football</span>
        </Link>

        {/* Acciones desktop */}
        <div className={styles.actions}>
          {isAuth ? (
            <>
              <Link to="/profile" className={styles.user}>
                <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
                <span className={styles.username}>{user?.name}</span>
              </Link>
              <div className={styles.divider} />
              <Link to="/my-matches" className={`${styles.btn} ${styles.btnGhost}`}>
                Mis partidos
              </Link>
              <Link to="/matches/create" className={`${styles.btn} ${styles.btnPrimary}`}>
                + Crear partido
              </Link>
              <button className={`${styles.btn} ${styles.btnLogout}`} onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${styles.btn} ${styles.btnGhost}`}>
                Iniciar sesión
              </Link>
              <Link to="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Botón hamburguesa — solo móvil */}
        <button
          className={styles.hamburger}
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? (
            // X
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            // Hamburguesa
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Overlay oscuro */}
      {open && <div className={styles.overlay} onClick={handleOverlayClick} />}

      {/* Menú desplegable móvil */}
      <div className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}>
        {isAuth ? (
          <>
            <div className={styles.mobileUser}>
              <div className={styles.mobileAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className={styles.mobileUserName}>{user?.name}</div>
                <div className={styles.mobileUserEmail}>{user?.email}</div>
              </div>
            </div>
            <div className={styles.mobileDivider} />
            <button className={styles.mobileItem} onClick={() => handleNav("/my-matches")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Mis partidos
            </button>
            <button className={styles.mobileItem} onClick={() => handleNav("/matches/create")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
              Crear partido
            </button>
            <div className={styles.mobileDivider} />
            <button className={`${styles.mobileItem} ${styles.mobileItemLogout}`} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <button className={styles.mobileItem} onClick={() => handleNav("/login")}>
              Iniciar sesión
            </button>
            <button className={`${styles.mobileItem} ${styles.mobileItemPrimary}`} onClick={() => handleNav("/register")}>
              Registrarse
            </button>
          </>
        )}
      </div>

      <div className={styles.offset} />
    </>
  );
}