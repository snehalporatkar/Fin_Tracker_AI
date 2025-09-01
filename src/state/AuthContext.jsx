import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);

const STORAGE_KEY = "rfa_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  },[]);

  const loginWithFakeGoogle = async () => {
    const fake = {
      id: "local-uid-1",
      email: "you@example.com",
      name: "Local User",
      picture: "https://api.dicebear.com/6.x/pixel-art/svg?seed=FinanceUser"
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fake));
    setUser(fake);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, setUser, loading, loginWithFakeGoogle, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
