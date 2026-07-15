import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "./firebase";
import { syncUserAccount } from "./userService";
import { getAuthErrorMessage } from "../utils/authErrors";
import { clearSessionMarker, markSessionActive } from "./authTokenService";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const GOOGLE_REDIRECT_FLAG = "vibe.googleRedirectPending";

function hasGoogleRedirectParams() {
  if (typeof window === "undefined") return false;

  const { search, hash } = window.location;
  return (
    search.includes("apiKey=") ||
    hash.includes("apiKey=") ||
    hash.includes("access_token=") ||
    hash.includes("id_token=")
  );
}

function shouldCompleteGoogleRedirect() {
  if (typeof window === "undefined") return false;

  try {
    return (
      sessionStorage.getItem(GOOGLE_REDIRECT_FLAG) === "1" ||
      hasGoogleRedirectParams()
    );
  } catch {
    return hasGoogleRedirectParams();
  }
}

function clearGoogleRedirectFlag() {
  try {
    sessionStorage.removeItem(GOOGLE_REDIRECT_FLAG);
  } catch {
    // ignore
  }
}

function shouldUseGoogleRedirect() {
  if (typeof window === "undefined") return false;

  const isEmbeddedWebView =
    window.ReactNativeWebView != null || window.VibePush != null;

  return isEmbeddedWebView;
}

function getVerificationSettings() {
  return {
    url: `${window.location.origin}/login?verified=1`,
    handleCodeInApp: false,
  };
}

async function sendVerificationEmail(user) {
  await sendEmailVerification(user, getVerificationSettings());
}

function wrapAuthError(error) {
  if (error?.message && !error?.code) throw error;
  throw new Error(getAuthErrorMessage(error?.code, error?.message));
}

export async function registerWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);

    if (methods.includes("google.com")) {
      throw new Error(
        "Este e-mail já está vinculado ao Google. Use 'Cadastrar com Google' ou entre com Google."
      );
    }

    if (methods.includes("password")) {
      throw new Error("Este e-mail já está cadastrado. Faça login.");
    }

    const credential = await createUserWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    await sendVerificationEmail(credential.user);
    await syncUserAccount(credential.user, { provider: "password" });
    await signOut(auth);

    return { user: credential.user, needsEmailVerification: true };
  } catch (error) {
    wrapAuthError(error);
  }
}

export async function loginWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    if (!credential.user.emailVerified) {
      await signOut(auth);
      throw new Error(
        "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada."
      );
    }

    const profile = await syncUserAccount(credential.user, { provider: "password" });
    markSessionActive(credential.user.uid);
    return { user: credential.user, profile };
  } catch (error) {
    wrapAuthError(error);
  }
}

export async function loginWithGoogle() {
  try {
    if (shouldUseGoogleRedirect()) {
      try {
        sessionStorage.setItem(GOOGLE_REDIRECT_FLAG, "1");
      } catch {
        // ignore
      }
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    const credential = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserAccount(credential.user, { provider: "google" });
    markSessionActive(credential.user.uid);
    return { user: credential.user, profile };
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email;
      throw new Error(
        `O e-mail ${email} já foi cadastrado com senha. Entre com e-mail e senha.`
      );
    }
    wrapAuthError(error);
  }
}

export async function completeGoogleRedirectLogin() {
  if (!shouldCompleteGoogleRedirect()) return null;

  try {
    const credential = await getRedirectResult(auth);
    clearGoogleRedirectFlag();

    if (!credential?.user) return null;

    const profile = await syncUserAccount(credential.user, { provider: "google" });
    markSessionActive(credential.user.uid);
    return { user: credential.user, profile };
  } catch (error) {
    clearGoogleRedirectFlag();

    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email;
      throw new Error(
        `O e-mail ${email} já foi cadastrado com senha. Entre com e-mail e senha.`
      );
    }

    if (
      error.code === "auth/argument-error" ||
      error.code === "auth/no-auth-event"
    ) {
      return null;
    }

    wrapAuthError(error);
  }
}

export async function resendEmailVerification(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password
    );

    if (credential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Este e-mail já foi confirmado. Faça login normalmente.");
    }

    await sendVerificationEmail(credential.user);
    await syncUserAccount(credential.user, { provider: "password" });
    await signOut(auth);
  } catch (error) {
    wrapAuthError(error);
  }
}

export async function logoutUser() {
  clearSessionMarker();
  await signOut(auth);
}

export async function loadAuthenticatedProfile(firebaseUser) {
  if (!firebaseUser) return null;
  return syncUserAccount(firebaseUser);
}
