import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUnreadCount,
  markNotificationsAsRead,
  subscribeNotifications,
} from "../services/notificationService";

export function useNotifications() {
  const { user, profile, reloadProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeNotifications((items) => {
      setNotifications(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const unreadCount = useMemo(
    () => getUnreadCount(notifications, profile?.notificationsReadAt),
    [notifications, profile?.notificationsReadAt]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await markNotificationsAsRead(user.uid);
    await reloadProfile();
  }, [user, reloadProfile]);

  return {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
  };
}
