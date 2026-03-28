'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessionUser, signOut as authSignOut, type UserProfile } from '@/lib/auth';

export interface SessionState {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => void;
}

export function useSession(): SessionState {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setLoading(true);
    const u = await getSessionUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
    window.location.href = '/';
  };

  return {
    user,
    loading,
    signOut: handleSignOut,
    refresh: loadSession,
  };
}
