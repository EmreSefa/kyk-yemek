import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextProps extends AuthState {
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prevState) => ({
        ...prevState,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prevState) => ({
        ...prevState,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!state.session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
