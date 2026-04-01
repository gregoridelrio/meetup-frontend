import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 60px;
          background: #25671E;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          box-shadow: 0 2px 16px rgba(37, 103, 30, 0.18);
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .navbar-logo-icon {
          width: 30px; height: 30px;
          background: #48A111;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .navbar-logo-name {
          font-family: 'Bebas Neue', cursive;
          font-size: 20px;
          letter-spacing: 0.08em;
          color: #F7F0F0;
          white-space: nowrap;
        }

        /* Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* User chip */
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(247, 240, 240, 0.7);
        }
        .navbar-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #48A111;
          color: #F7F0F0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }
        .navbar-username {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Buttons */
        .navbar-btn {
          padding: 7px 16px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .navbar-btn-ghost {
          background: rgba(247, 240, 240, 0.1);
          color: #F7F0F0;
          border: 1.5px solid rgba(247, 240, 240, 0.2);
        }
        .navbar-btn-ghost:hover {
          background: rgba(247, 240, 240, 0.18);
          border-color: rgba(247, 240, 240, 0.4);
        }
        .navbar-btn-primary {
          background: #F2B50B;
          color: #1a2e14;
        }
        .navbar-btn-primary:hover {
          background: #e0a608;
          transform: translateY(-1px);
        }
        .navbar-btn-logout {
          background: rgba(224, 92, 42, 0.15);
          color: #f4a080;
          border: 1.5px solid rgba(224, 92, 42, 0.25);
        }
        .navbar-btn-logout:hover {
          background: rgba(224, 92, 42, 0.25);
        }

        .navbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(247, 240, 240, 0.15);
        }

        /* Offset para el contenido bajo el navbar */
        .navbar-offset {
          height: 60px;
        }

        @media (max-width: 480px) {
          .navbar { padding: 0 16px; }
          .navbar-username { display: none; }
          .navbar-btn { padding: 7px 12px; }
        }
      `}</style>

      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">⚽</div>
          <span className="navbar-logo-name">Meetup Football</span>
        </Link>

        <div className="navbar-actions">
          {isAuth ? (
            <>
              {user && (
                <div className="navbar-user">
                  <div className="navbar-avatar">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="navbar-username">{user.name}</span>
                </div>
              )}
              {isAuth && (
                <Link to="/matches/create" className="navbar-btn navbar-btn-primary">
                  + Crear partido
                </Link>
              )}
              <div className="navbar-divider" />
              <button className="navbar-btn navbar-btn-logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn navbar-btn-ghost">
                Iniciar sesión
              </Link>
              <Link to="/register" className="navbar-btn navbar-btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="navbar-offset" />
    </>
  );
}