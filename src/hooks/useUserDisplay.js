import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export function useUserDisplay(userId, fallback = {}) {
  const [liveProfile, setLiveProfile] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLiveProfile(null);
      return;
    }

    const ref = doc(db, "users", userId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setLiveProfile(snap.exists() ? { uid: userId, ...snap.data() } : null);
    });

    return unsubscribe;
  }, [userId]);

  const displayName =
    liveProfile?.displayName ||
    fallback.displayName ||
    fallback.email?.split("@")[0] ||
    "Usuário";

  const photoURL = liveProfile?.photoURL ?? fallback.photoURL ?? null;

  return { displayName, photoURL, profile: liveProfile };
}
