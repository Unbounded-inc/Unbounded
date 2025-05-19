import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  bio?: string;
  profile_picture?: string;
  is_anonymous: boolean;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  auth0_id?: string;
  privacy?: string;
  notifications?: boolean;
}


interface UserContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;   // ✅ added here
  refreshUser: () => void;          // ✅ keep for compatibility (optional)
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  fetchUser: async () => {},       // ✅ default fallback
  refreshUser: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/auth/me", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem("userId", data.user.id);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("http://localhost:5001/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  useEffect(() => {
    void fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        fetchUser,
        refreshUser: fetchUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
