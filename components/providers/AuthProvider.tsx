'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/browser';
import { SavedName } from '@/lib/types/tools';

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  savedNames: SavedName[] | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSavedNames: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedNames, setSavedNames] = useState<SavedName[] | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Data fetchers
  const fetchUserProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', uid).single();
    if (error) console.error(error);
    setProfile(data ?? null);
  }, []);

  const fetchSavedNames = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('user_saved_names')
      .select('*')
      .eq('user_id', uid)
      .order('favorited_at', { ascending: false });
    if (error) console.error(error);
    setSavedNames(data ?? []);
  }, []);

  useEffect(() => {
    // 1) grab whatever is in the cookie (optimistic)
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setSession(data.session);
      
      if (sessionUser) {
        await Promise.all([fetchUserProfile(sessionUser.id), fetchSavedNames(sessionUser.id)]);
      }
      
      setLoading(false);
    });

    // 2) listen for all future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setUser(sess?.user ?? null);
      setSession(sess);
      
      if (sess?.user) {
        await Promise.all([fetchUserProfile(sess.user.id), fetchSavedNames(sess.user.id)]);
      } else {
        setProfile(null);
        setSavedNames(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, fetchSavedNames]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const refreshSavedNames = async () => {
    if (user) {
      await fetchSavedNames(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    savedNames,
    loading,
    logout,
    refreshSavedNames,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 