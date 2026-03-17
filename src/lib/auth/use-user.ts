"use client";
import { useState, useEffect } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
        if (data.role) {
          setRole(data.role);
        }
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  return { user, role, isLoaded, isSignedIn: !!user };
}
