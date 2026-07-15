import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { setupExpoPushBridge } from "../services/pushTokenService";

export default function PushTokenBridge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    return setupExpoPushBridge(user.uid);
  }, [user?.uid]);

  return null;
}
