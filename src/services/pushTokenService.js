import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { PUSH_PROVIDERS } from "../constants/notifications";

function getTokenDocId(token) {
  return token.replace(/[^a-zA-Z0-9]/g, "").slice(-40) || "default";
}

export async function registerExpoPushToken(userId, token, platform = "unknown") {
  if (!userId || !token?.startsWith?.("ExponentPushToken")) {
    console.warn("Token Expo inválido ou usuário ausente.");
    return;
  }

  const tokenDocId = getTokenDocId(token);

  await setDoc(
    doc(db, "users", userId, "pushTokens", tokenDocId),
    {
      token,
      platform,
      provider: PUSH_PROVIDERS.EXPO,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function setupExpoPushBridge(userId) {
  if (!userId || typeof window === "undefined") return () => {};

  async function handleToken(token, platform) {
    try {
      await registerExpoPushToken(userId, token, platform);
    } catch (error) {
      console.error("Erro ao registrar token Expo:", error);
    }
  }

  window.VibePush = {
    registerToken: handleToken,
  };

  function onExpoPushToken(event) {
    const { token, platform } = event.detail ?? {};
    if (token) handleToken(token, platform);
  }

  window.addEventListener("expo-push-token", onExpoPushToken);
  window.dispatchEvent(new CustomEvent("vibe-push-ready", { detail: { userId } }));

  return () => {
    delete window.VibePush;
    window.removeEventListener("expo-push-token", onExpoPushToken);
  };
}
