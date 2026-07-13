import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

const STORAGE_KEY = "detour_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUserState(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      AsyncStorage.removeItem(STORAGE_KEY);
    }
  };

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
