import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { ROLES } from "../constants/roles";
import UserAvatar from "./UserAvatar";
import UserName from "./UserName";
import BellIcon from "./BellIcon";

function NotificationNavLink({ className = "" }) {
  const { unreadCount } = useNotifications();

  return (
    <NavLink
      to="/notificacoes"
      className={`nav-notifications ${className}`.trim()}
      aria-label={
        unreadCount > 0
          ? `Notificações, ${unreadCount} não lidas`
          : "Notificações"
      }
      title="Notificações"
    >
      <BellIcon className="nav-bell-icon" />
      {unreadCount > 0 && (
        <span className="nav-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
      )}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, profile, isAdmin, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isShowcase = location.pathname === "/";
  const isFeed = location.pathname === "/comunidade";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          type="button"
          className="nav-overlay"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <img
              src="/logo-vibe-paulista.png"
              alt="Vibe Paulista"
              className="brand-logo"
            />
          </Link>

          <div className="navbar-actions">
            {!loading && user && (
              <NotificationNavLink className="nav-notifications--header" />
            )}
            <button
              type="button"
              className="nav-toggle"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={`nav-toggle-icon${menuOpen ? " open" : ""}`} />
            </button>
          </div>

          <nav className={`nav-links${menuOpen ? " open" : ""}`}>
            <div className="nav-primary">
              <NavLink to="/" end>
                Início
              </NavLink>
              <NavLink to="/comunidade">Comunidade</NavLink>
            </div>

            {!loading && !user && (
              <div className="nav-guest">
                <NavLink to="/login" className="nav-text-link">
                  Entrar
                </NavLink>
                <NavLink to="/register" className="nav-btn-primary">
                  Cadastrar
                </NavLink>
              </div>
            )}

            {!loading && user && (
              <div className="nav-session">
                <div className="nav-tools">
                  <NotificationNavLink className="nav-notifications--menu" />
                  {isAdmin && (
                    <NavLink to="/admin" className="nav-admin-link">
                      Admin
                    </NavLink>
                  )}
                </div>

                <span className="nav-divider" aria-hidden />

                <Link to="/perfil" className="nav-user-chip">
                  <UserAvatar
                    userId={user.uid}
                    fallback={{
                      displayName: profile?.displayName,
                      photoURL: profile?.photoURL,
                    }}
                    className="nav-user-avatar"
                  />
                  <span className="nav-user-meta">
                    <span className="nav-user-name">
                      <UserName
                        userId={user.uid}
                        fallback={{ displayName: profile?.displayName }}
                      />
                    </span>
                    {profile?.role && profile.role !== "user" && (
                      <span className="nav-user-role">
                        {ROLES[profile.role]?.label}
                      </span>
                    )}
                  </span>
                </Link>

                <button
                  type="button"
                  className="nav-logout-btn"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main
        className={
          isShowcase
            ? "showcase-main"
            : `container${isFeed ? " container--feed" : ""}`
        }
      >
        {children}
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} Vibe Paulista — feito com boas vibes.
      </footer>
    </div>
  );
}
