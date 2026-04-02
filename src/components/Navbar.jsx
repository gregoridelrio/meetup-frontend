import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>⚽</div>
          <span className={styles.logoName}>Meetup Football</span>
        </Link>

        <div className={styles.actions}>
          {isAuth ? (
            <>
              <Link to="/profile" className={styles.user}>
                <div className={styles.avatar}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className={styles.username}>{user?.name}</span>
              </Link>
              <div className={styles.divider} />
              {isAuth && (
                <Link to="/my-matches" className={`${styles.btn} ${styles.btnGhost}`}>
                  Mis partidos
                </Link>
              )}
              {isAuth && (
                <Link to="/matches/create" className={`${styles.btn} ${styles.btnPrimary}`}>
                  + Crear partido
                </Link>
              )}
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
      </nav>

      <div className={styles.offset} />
    </>
  );
}