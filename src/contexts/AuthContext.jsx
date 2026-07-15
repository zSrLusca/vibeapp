import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, reload } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resendEmailVerification,
  logoutUser,
  loadAuthenticatedProfile,
} from "../services/authService";
import {
  setupMobileSessionRefresh,
  subscribeAuthTokenChanges,
} from "../services/authTokenService";
import { getUserProfile, updateUserProfile } from "../services/userService";
import { ensureGamificationDefaults } from "../services/gamificationService";
import { hasPermission, canAccessAdmin } from "../constants/roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }

    try {
      let userProfile = await getUserProfile(firebaseUser.uid);

      if (!userProfile) {
        userProfile = await loadAuthenticatedProfile(firebaseUser);
      }

      if (userProfile && userProfile.points === undefined) {
        await ensureGamificationDefaults(firebaseUser.uid);
        userProfile = await getUserProfile(firebaseUser.uid);
      }

      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await loadProfile(currentUser);
      setLoading(false);
    });

    const unsubscribeToken = subscribeAuthTokenChanges(() => {});
    const unsubscribeResume = setupMobileSessionRefresh();

    return () => {
      unsubscribe();
      unsubscribeToken();
      unsubscribeResume();
    };
  }, [loadProfile]);

  async function refreshUser() {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    setUser({ ...auth.currentUser });
    await loadProfile(auth.currentUser);
  }

  async function register(email, password) {
    const result = await registerWithEmail(email, password);
    return result.user;
  }

  async function login(email, password) {
    const result = await loginWithEmail(email, password);
    return result.user;
  }

  async function loginWithGoogleAccount() {
    const result = await loginWithGoogle();
    return result.user;
  }

  async function resendVerification(email, password) {
    await resendEmailVerification(email, password);
  }

  async function logout() {
    await logoutUser();
    setProfile(null);
  }

  async function updateProfile(data) {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    const updated = await updateUserProfile(auth.currentUser.uid, data);
    setProfile(updated);
    return updated;
  }

  function checkPermission(permission) {
    if (!profile) return false;
    return hasPermission(profile.role, permission);
  }

  const role = profile?.role ?? "user";
  const isAdmin = canAccessAdmin(role);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAdmin,
        register,
        login,
        loginWithGoogle: loginWithGoogleAccount,
        logout,
        resendVerification,
        refreshUser,
        updateProfile,
        hasPermission: checkPermission,
        reloadProfile: () => loadProfile(auth.currentUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
