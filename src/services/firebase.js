import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQ2gPxW1SUEctqHRjbYjojZzO7FOLCzwo",
  authDomain: "appviberp.firebaseapp.com",
  projectId: "appviberp",
  storageBucket: "appviberp.firebasestorage.app",
  messagingSenderId: "84254919314",
  appId: "1:84254919314:web:e4948b5abdf054e615b44b",
};

export const app = initializeApp(firebaseConfig);

function isEmbeddedWebView() {
  if (typeof window === "undefined") return false;
  return window.ReactNativeWebView != null || window.VibePush != null;
}

function createAuth() {
  if (!isEmbeddedWebView()) {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (error) {
    if (error.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
