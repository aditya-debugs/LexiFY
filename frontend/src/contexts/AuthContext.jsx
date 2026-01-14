import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Get the ID token
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setIdToken(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Refresh token periodically (every 55 minutes)
  useEffect(() => {
    if (!firebaseUser) return;

    const refreshToken = async () => {
      try {
        const token = await firebaseUser.getIdToken(true); // Force refresh
        setIdToken(token);
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    };

    const interval = setInterval(refreshToken, 55 * 60 * 1000); // 55 minutes

    return () => clearInterval(interval);
  }, [firebaseUser]);

  const value = {
    firebaseUser,
    loading,
    idToken,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
