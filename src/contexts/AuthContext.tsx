
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface User {
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

const SUPER_ADMIN_EMAIL = 'marianela.grafimoda@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is stored in localStorage first (fallback)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Check session with Supabase
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { email } = data.session.user;
        // Check if admin in a real app, we would use claims or a separate table
        const isAdmin = email === SUPER_ADMIN_EMAIL;
        const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
        const userData = { email, isAdmin, isSuperAdmin };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    };
    
    checkSession();
    
    // Setup auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { email } = session.user;
          const isAdmin = email === SUPER_ADMIN_EMAIL;
          const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
          const userData = { email, isAdmin, isSuperAdmin };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Try Supabase auth first
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase login error:', error.message);
        
        // Fallback to hard-coded admin for development
        if (email === SUPER_ADMIN_EMAIL && password === 'marianelalinda2025') {
          const adminUser = { 
            email, 
            isAdmin: true,
            isSuperAdmin: true 
          };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          return true;
        }
        
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to hard-coded admin
      if (email === SUPER_ADMIN_EMAIL && password === 'marianelalinda2025') {
        const adminUser = { 
          email, 
          isAdmin: true,
          isSuperAdmin: true 
        };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      }
      
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        isSuperAdmin: user?.isSuperAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
