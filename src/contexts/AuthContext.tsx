
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface User {
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Get the current session on mount
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { email } = session.user;
        const isAdmin = email === 'marianela.grafimoda@gmail.com';
        setUser({ email, isAdmin });
      }
    };
    
    getSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && event === 'SIGNED_IN') {
          const { email } = session.user;
          const isAdmin = email === 'marianela.grafimoda@gmail.com';
          setUser({ email, isAdmin });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (email === 'marianela.grafimoda@gmail.com' && password === 'marianelalinda2025') {
        // For the admin user, we'll use Supabase auth
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Error logging in:', error.message);
          toast({
            title: "Error de autenticación",
            description: error.message,
            variant: "destructive",
          });
          return false;
        }
        
        setUser({ email, isAdmin: true });
        return true;
      }
      
      // For non-admin users
      return false;
    } catch (error) {
      console.error('Unexpected login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
        toast({
          title: "Error",
          description: "Error al cerrar sesión",
          variant: "destructive",
        });
      }
      setUser(null);
    } catch (error) {
      console.error('Unexpected logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
