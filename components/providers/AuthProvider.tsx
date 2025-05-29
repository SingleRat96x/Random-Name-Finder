'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
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
  isLoading: boolean;
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
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedNames, setSavedNames] = useState<SavedName[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Next.js router for redirection
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createClient();

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
      } else {
        setProfile(profile);
      }
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      setProfile(null);
    }
  }, [supabase]);

  // Function to fetch user's saved names
  const fetchSavedNames = useCallback(async (userId: string) => {
    try {
      const { data: savedNames, error } = await supabase
        .from('user_saved_names')
        .select('*')
        .eq('user_id', userId)
        .order('favorited_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved names:', error);
        setSavedNames(null);
      } else {
        setSavedNames(savedNames || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching saved names:', err);
      setSavedNames(null);
    }
  }, [supabase]);

  // Function to refresh saved names (exposed to components)
  const refreshSavedNames = useCallback(async () => {
    if (user?.id) {
      await fetchSavedNames(user.id);
    }
  }, [user?.id, fetchSavedNames]);

  // Simplified logout function - let onAuthStateChange handle state updates
  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Sign out from Supabase - this will trigger onAuthStateChange with SIGNED_OUT
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        // If signOut fails, manually trigger state clearing as fallback
        setUser(null);
        setSession(null);
        setProfile(null);
        setSavedNames(null);
        setIsLoading(false);
      }

      // Navigate away from protected routes
      router.push('/');
      
      // Refresh to ensure server-side state consistency
      // Use a longer delay to ensure navigation completes
      setTimeout(() => {
        router.refresh();
      }, 200);

    } catch (err) {
      console.error('Unexpected error during logout:', err);
      
      // On error, manually clear state as fallback
      setUser(null);
      setSession(null);
      setProfile(null);
      setSavedNames(null);
      setIsLoading(false);
      router.push('/');
      setTimeout(() => {
        router.refresh();
      }, 200);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Listen for auth state changes - this is the primary state driver
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        // Handle specific auth events
        if (event === 'INITIAL_SESSION') {
          console.log('Initial session loaded:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            await fetchSavedNames(session.user.id);
          } else {
            setProfile(null);
            setSavedNames(null);
          }
          
          setInitialCheckDone(true);
          setIsLoading(false);

        } else if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            await fetchSavedNames(session.user.id);
          }
          setIsLoading(false);
          
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out - clearing all state');
          // Clear all user-related state on sign out
          setUser(null);
          setSession(null);
          setProfile(null);
          setSavedNames(null);
          setIsLoading(false);
          
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            await fetchSavedNames(session.user.id);
          }
          setIsLoading(false);

        } else {
          // Handle any other events
          console.log('Other auth event:', event);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            await fetchSavedNames(session.user.id);
          } else {
            setProfile(null);
            setSavedNames(null);
          }
          setIsLoading(false);
        }
      }
    );

    // Fallback: If initial session event doesn't fire within reasonable time
    const fallbackTimer = setTimeout(() => {
      if (!initialCheckDone && mounted) {
        console.log('Fallback: Initial session check timeout, setting loading to false');
        setIsLoading(false);
        setInitialCheckDone(true);
      }
    }, 9000);

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchUserProfile, fetchSavedNames, initialCheckDone]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    savedNames,
    isLoading,
    logout,
    refreshSavedNames,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 