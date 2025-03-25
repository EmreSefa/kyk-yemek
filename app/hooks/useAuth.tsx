import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextProps extends AuthState {
  signUp: (
    email: string,
    password: string,
    userData?: { [key: string]: any }
  ) => Promise<boolean>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message?: string;
    user?: User;
  }>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  session: null,
  user: null,
  isLoading: true,
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        ...initialState,
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData?: { [key: string]: any }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      return !error;
    } catch (err) {
      console.error("Sign up error:", err);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First, ensure email is normalized (trimmed and lowercase)
      const normalizedEmail = email.trim().toLowerCase();

      console.log("Attempting to sign in with:", normalizedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error("Sign in error details:", error.message, error.status);
        return { success: false, message: error.message };
      }

      console.log(
        "Supabase auth successful:",
        !!data.session,
        "User:",
        data.user?.email
      );

      // Update local state immediately to avoid delay
      setState({
        session: data.session,
        user: data.user,
        isLoading: false,
      });

      return { success: true, user: data.user };
    } catch (err) {
      console.error("Sign in error:", err);
      return { success: false, message: "Bir bağlantı hatası oluştu." };
    }
  };

  const signOut = async () => {
    try {
      // Clear any stored preferences from AsyncStorage
      const CITY_STORAGE_KEY = "kyk_yemek_selected_city";
      const UNIVERSITY_STORAGE_KEY = "kyk_yemek_selected_university";
      const DORM_STORAGE_KEY = "kyk_yemek_selected_dorm";

      // Remove all stored preferences
      await Promise.all([
        AsyncStorage.removeItem(CITY_STORAGE_KEY),
        AsyncStorage.removeItem(UNIVERSITY_STORAGE_KEY),
        AsyncStorage.removeItem(DORM_STORAGE_KEY),
      ]);

      // Now sign out from Supabase
      const { error } = await supabase.auth.signOut();
      return !error;
    } catch (err) {
      console.error("Sign out error:", err);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "kyk-yemek://reset-password",
      });

      if (error) {
        console.error("Password reset error:", error);
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Reset password error:", err);
      return { success: false, message: "Bir bağlantı hatası oluştu." };
    }
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
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
