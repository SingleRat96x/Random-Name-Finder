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
  avatar_url: string | null;
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

// Simple in-memory cache to prevent duplicate queries
const profileCache = new Map<string, UserProfile | null>();
const savedNamesCache = new Map<string, SavedName[]>();

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedNames, setSavedNames] = useState<SavedName[] | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Data fetchers
  const fetchUserProfile = useCallback(async (uid: string) => {
    if (profileCache.has(uid)) {
      const cachedProfile = profileCache.get(uid) ?? null;
      setProfile(cachedProfile);
      return;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', uid).single();
    if (error) console.error(error);
    const profileData = data ?? null;
    profileCache.set(uid, profileData);
    setProfile(profileData);
  }, []);

  const fetchSavedNames = useCallback(async (uid: string) => {
    if (savedNamesCache.has(uid)) {
      const cachedNames = savedNamesCache.get(uid);
      setSavedNames(cachedNames || []);
      return;
    }

    const { data, error } = await supabase
      .from('user_saved_names')
      .select('*')
      .eq('user_id', uid)
      .order('favorited_at', { ascending: false });
    if (error) console.error(error);
    const namesData = data ?? [];
    savedNamesCache.set(uid, namesData);
    setSavedNames(namesData);
  }, []);

  useEffect(() => {
    // 1) grab whatever is in the cookie (optimistic)
    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setSession(data.session);
      setLoading(false);
      
      if (sessionUser) {
        console.time('profile+names');
        Promise.allSettled([fetchUserProfile(sessionUser.id), fetchSavedNames(sessionUser.id)]);
        console.timeEnd('profile+names');
      }
    });

    // 2) listen for all future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setUser(sess?.user ?? null);
      setSession(sess);
      setLoading(false);        // ensure spinner stops in all tabs
      
      if (sess?.user) {
        console.time('profile+names');
        Promise.allSettled([fetchUserProfile(sess.user.id), fetchSavedNames(sess.user.id)]);
        console.timeEnd('profile+names');
      } else {
        setProfile(null);
        setSavedNames(null);
        // Clear cache when user logs out
        profileCache.clear();
        savedNamesCache.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, fetchSavedNames]);

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      setLoading(false);
      return;
    }
    router.push('/login');          // rely on middleware to guard other pages
  };

  const refreshSavedNames = async () => {
    if (user) {
      // Clear cache for this user before fetching fresh data
      savedNamesCache.delete(user.id);
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