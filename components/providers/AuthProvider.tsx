'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
  // Session timeout related
  sessionTimeoutWarning: boolean;
  extendSession: () => void;
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

// Session timeout configuration
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // Show warning 2 minutes before logout
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedNames, setSavedNames] = useState<SavedName[] | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Session timeout state
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const router = useRouter();

  // Data fetchers - memoized to prevent recreation on every render
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

  // Session timeout functions - memoized to prevent recreation
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    setSessionTimeoutWarning(false);
  }, []);

  const handleInactivityLogout = useCallback(async () => {
    console.log('Auto-logout due to inactivity');
    clearTimeouts();
    
    try {
      await supabase.auth.signOut();
      // Show notification that session expired
      if (typeof window !== 'undefined') {
        alert('Your session has expired due to inactivity. Please log in again.');
      }
      router.push('/login');
    } catch (error) {
      console.error('Error during auto-logout:', error);
    }
  }, [clearTimeouts, router]);

  const showSessionWarning = useCallback(() => {
    console.log('Showing session timeout warning');
    setSessionTimeoutWarning(true);
    
    // Set final logout timeout
    timeoutRef.current = setTimeout(handleInactivityLogout, WARNING_TIME);
  }, [handleInactivityLogout]);

  const resetInactivityTimer = useCallback(() => {
    if (!user) return;
    
    const now = Date.now();
    lastActivityRef.current = now;
    
    // Clear existing timeouts
    clearTimeouts();
    
    // Set warning timeout
    warningTimeoutRef.current = setTimeout(showSessionWarning, INACTIVITY_TIMEOUT - WARNING_TIME);
  }, [user, clearTimeouts, showSessionWarning]);

  const extendSession = useCallback(() => {
    console.log('Session extended by user');
    clearTimeouts();
    resetInactivityTimer();
  }, [clearTimeouts, resetInactivityTimer]);

  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    // Only reset timer if enough time has passed to avoid excessive resets
    if (now - lastActivityRef.current > 30000) { // 30 seconds throttle
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  // Set up activity listeners
  useEffect(() => {
    if (!user) {
      clearTimeouts();
      return;
    }

    // Start the inactivity timer
    resetInactivityTimer();

    // Add activity event listeners
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      // Clean up event listeners
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearTimeouts();
    };
  }, [user, resetInactivityTimer, handleUserActivity, clearTimeouts]);

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
        // Clear session timeouts when user logs out
        clearTimeouts();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, fetchSavedNames, clearTimeouts]);

  const logout = useCallback(async () => {
    setLoading(true);
    clearTimeouts(); // Clear timeouts before logout
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      setLoading(false);
      return;
    }
    router.push('/login');          // rely on middleware to guard other pages
  }, [clearTimeouts, router]);

  const refreshSavedNames = useCallback(async () => {
    if (user) {
      // Clear cache for this user before fetching fresh data
      savedNamesCache.delete(user.id);
      await fetchSavedNames(user.id);
    }
  }, [user, fetchSavedNames]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    profile,
    savedNames,
    loading,
    logout,
    refreshSavedNames,
    sessionTimeoutWarning,
    extendSession,
  }), [
    user,
    session,
    profile,
    savedNames,
    loading,
    logout,
    refreshSavedNames,
    sessionTimeoutWarning,
    extendSession,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 