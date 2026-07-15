import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function getBootstrapSuperadminEmails() {
  return (
    import.meta.env.VITE_SUPERADMIN_EMAIL?.split(",").map((e) => e.trim().toLowerCase()) ?? []
  );
}

function getAuthProviders(user) {
  const providers = user.providerData?.map((p) => p.providerId).filter(Boolean) ?? [];
  return [...new Set(providers)];
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

export async function syncUserAccount(user, options = {}) {
  const ref = doc(db, "users", user.uid);

  try {
    const snap = await getDoc(ref);
    const providers = getAuthProviders(user);
    const email = user.email?.toLowerCase() ?? null;

    if (snap.exists()) {
      const existing = snap.data();
      const superadminEmails = getBootstrapSuperadminEmails();
      const updates = {
        email,
        emailVerified: user.emailVerified,
        lastLoginAt: serverTimestamp(),
      };

      if (superadminEmails.includes(email) && existing.role !== "superadmin") {
        updates.role = "superadmin";
      }

      const mergedProviders = [...new Set([...(existing.authProviders ?? []), ...providers])];
      if (options.provider === "google") mergedProviders.push("google.com");
      if (options.provider === "password") mergedProviders.push("password");
      updates.authProviders = [...new Set(mergedProviders)];

      await updateDoc(ref, updates);
      return { uid: user.uid, ...existing, ...updates };
    }

    const superadminEmails = getBootstrapSuperadminEmails();
    const role = superadminEmails.includes(email) ? "superadmin" : "user";

    const profile = {
      email,
      displayName: user.displayName || email?.split("@")[0] || "Usuário",
      photoURL: user.photoURL || null,
      role,
      emailVerified: user.emailVerified,
      authProviders: options.provider === "google" ? ["google.com"] : ["password"],
      points: 0,
      stats: { reactions: 0, comments: 0 },
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(ref, profile);
    return { uid: user.uid, ...profile };
  } catch (error) {
    console.error("Erro ao sincronizar perfil:", error);

    if (error.code === "permission-denied") {
      throw new Error(
        "Conta criada no Firebase Auth, mas o perfil não pôde ser salvo. Configure as regras do Firestore (coleção users)."
      );
    }

    throw new Error("Erro ao sincronizar sua conta. Tente novamente.");
  }
}

export async function listUsers() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, "users", uid), { role });
}

export async function updateUserProfile(uid, { displayName, photoURL }) {
  const updates = {};

  if (displayName !== undefined) {
    updates.displayName = displayName.trim();
  }

  if (photoURL !== undefined) {
    updates.photoURL = photoURL.trim() || null;
  }

  updates.updatedAt = serverTimestamp();

  await updateDoc(doc(db, "users", uid), updates);
  return getUserProfile(uid);
}
