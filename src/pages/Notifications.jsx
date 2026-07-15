import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { markNotificationsAsRead } from "../services/notificationService";
import { NOTIFICATION_TYPES } from "../constants/notifications";
import { formatFeedDate } from "../utils/postContent";

function NotificationItem({ notification, isUnread }) {
  const date = notification.createdAt?.toDate?.();
  const href =
    notification.type === NOTIFICATION_TYPES.NEW_POST && notification.postId
      ? `/post/${notification.postId}`
      : "/comunidade";

  return (
    <Link
      to={href}
      className={`notification-item${isUnread ? " unread" : ""}`}
    >
      <div className="notification-icon" aria-hidden>
        📢
      </div>
      <div className="notification-content">
        <strong>{notification.postTitle || "Nova publicação"}</strong>
        <p>{notification.excerpt}</p>
        <div className="notification-meta">
          {notification.authorDisplayName && (
            <span>por {notification.authorDisplayName}</span>
          )}
          {date && <time>{formatFeedDate(date)}</time>}
        </div>
      </div>
    </Link>
  );
}

export default function Notifications() {
  const { user, loading: authLoading, profile, reloadProfile } = useAuth();
  const { notifications, loading } = useNotifications();

  useEffect(() => {
    if (!user) return;
    markNotificationsAsRead(user.uid).then(() => reloadProfile());
  }, [user?.uid, reloadProfile]);

  if (authLoading) {
    return <p className="muted feed-status">Carregando…</p>;
  }

  if (!user) {
    return <Navigate to="/login?redirect=/notificacoes" replace />;
  }

  const readAt = profile?.notificationsReadAt?.toDate?.();

  return (
    <section className="notifications-page">
      <div className="page-header">
        <h1>Notificações</h1>
        <p className="subtitle">
          Novidades e publicações da comunidade
        </p>
      </div>

      {loading ? (
        <p className="muted feed-status">Carregando notificações…</p>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <span className="notifications-empty-icon" aria-hidden>
            🔔
          </span>
          <p>Nenhuma notificação por enquanto.</p>
          <Link to="/comunidade" className="post-link">
            Ver comunidade
          </Link>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const created = notification.createdAt?.toDate?.();
            const isUnread = !readAt || (created && created > readAt);

            return (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isUnread={isUnread}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
