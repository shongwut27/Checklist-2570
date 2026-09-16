import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBn8I_3MgMxTRVo_xB_FxTN17Otvto8pyU",
  authDomain: "checklist-a3cbd.firebaseapp.com",
  projectId: "checklist-a3cbd",
  storageBucket: "checklist-a3cbd.firebasestorage.app",
  messagingSenderId: "69776132553",
  appId: "1:69776132553:web:4408cfa7d642db4024018",
  measurementId: "G-D1T0Y0D39S"
};

const resolvedConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
};

const app = initializeApp(resolvedConfig);
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/presentations');

let isSigningIn = false;
let cachedAccessToken: string | null = localStorage.getItem('google_access_token');

export const getAccessToken = () => cachedAccessToken;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      localStorage.removeItem('google_access_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error("Failed to obtain Google access token.");
    }

    cachedAccessToken = accessToken;
    localStorage.setItem('google_access_token', accessToken);
    return { user: result.user, accessToken };
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await auth.signOut();
    cachedAccessToken = null;
    localStorage.removeItem('google_access_token');
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
