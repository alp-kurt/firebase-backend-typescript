import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "./firebase";

interface AuthContextValue {
  token: string | null;
  userEmail: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void setPersistence(auth, browserSessionPersistence);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setToken(null);
        setUserEmail(null);
        sessionStorage.removeItem("sessionToken");
        setLoading(false);
        return;
      }
      const idToken = await user.getIdToken();
      setToken(idToken);
      setUserEmail(user.email ?? null);
      sessionStorage.setItem("sessionToken", idToken);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    userEmail,
    loading,
    signIn: async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signOut: async () => {
      await signOut(auth);
    }
  }), [token, userEmail, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
