import { onIdTokenChanged } from "firebase/auth";
import { auth } from "./firebase";

const TOKEN_STORAGE_KEY = "vibe.auth.session";

export function markSessionActive(userId) {
  try {
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      JSON.stringify({ userId, updatedAt: Date.now() })
    );
  } catch {
    // WebView pode bloquear storage em modo privado.
  }
}

export function clearSessionMarker() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function refreshAuthToken(force = false) {
  const user = auth.currentUser;
  if (!user) return null;

  const token = await user.getIdToken(force);
  markSessionActive(user.uid);
  return token;
}

export function subscribeAuthTokenChanges(callback) {
  return onIdTokenChanged(auth, async (user) => {
    if (!user) {
      clearSessionMarker();
      callback(null);
      return;
    }

    try {
      const token = await user.getIdToken();
      markSessionActive(user.uid);
      callback(token);
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      callback(null);
    }
  });
}

export function setupMobileSessionRefresh() {
  async function handleResume() {
    if (document.visibilityState !== "visible") return;
    await refreshAuthToken(true);
  }

  document.addEventListener("visibilitychange", handleResume);
  window.addEventListener("pageshow", handleResume);
  window.addEventListener("focus", handleResume);

  const interval = window.setInterval(
    () => refreshAuthToken(true),
    50 * 60 * 1000
  );

  return () => {
    document.removeEventListener("visibilitychange", handleResume);
    window.removeEventListener("pageshow", handleResume);
    window.removeEventListener("focus", handleResume);
    window.clearInterval(interval);
  };
}
