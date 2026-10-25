import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check if we have real Supabase configured
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setIsDemoUser(false);
        } else {
          checkLocalDemoSession();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsDemoUser(false);
        } else {
          checkLocalDemoSession();
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local demo mode default
      checkLocalDemoSession();
      setLoading(false);
    }
  }, []);

  const checkLocalDemoSession = () => {
    try {
      const stored = localStorage.getItem('travelwise_demo_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setIsDemoUser(true);
      } else {
        // Auto-initialize demo traveler so users can immediately test without barriers
        const defaultDemoUser = {
          id: 'demo-user-123',
          email: 'alex.traveler@travelwise.ai',
          display_name: 'Alex Vance (Demo Traveler)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          is_demo: true,
        };
        localStorage.setItem('travelwise_demo_user', JSON.stringify(defaultDemoUser));
        setUser(defaultDemoUser);
        setIsDemoUser(true);
      }
    } catch (e) {
      console.error('Error reading demo session:', e);
      setUser(null);
    }
  };

  const loginWithSupabase = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please use Demo Login or provide Supabase keys in .env.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    setIsDemoUser(false);
    localStorage.removeItem('travelwise_demo_user');
    return data;
  };

  const signupWithSupabase = async (email, password, displayName) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please use Demo Mode.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const loginAsDemo = (customName = 'Alex Vance (Demo Traveler)') => {
    const demoUserObj = {
      id: 'demo-user-123',
      email: 'demo.traveler@travelwise.ai',
      display_name: customName,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      is_demo: true,
    };
    localStorage.setItem('travelwise_demo_user', JSON.stringify(demoUserObj));
    setUser(demoUserObj);
    setIsDemoUser(true);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('travelwise_demo_user');
    setUser(null);
    setIsDemoUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoUser,
        isSupabaseConfigured,
        loginWithSupabase,
        signupWithSupabase,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
