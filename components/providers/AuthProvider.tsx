'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

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
  isLoading: boolean;
  logout: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  // Next.js router for redirection
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createClient();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
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
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        // Even if there's an error, we should still clear local state
        // and redirect, as the user intent is to log out
      }

      // Clear local state (this will also happen via onAuthStateChange)
      setUser(null);
      setSession(null);
      setProfile(null);

      // Redirect to home page
      router.push('/');
      
      // Refresh to ensure server components update
      router.refresh();

    } catch (err) {
      console.error('Unexpected error during logout:', err);
      
      // Even on error, clear state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      router.push('/');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Fetch user profile if session exists
          if (session?.user) {
            fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error getting initial session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Fetch user profile if session exists
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', session?.user?.id);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 