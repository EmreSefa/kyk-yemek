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

      // Check if we have valid Supabase configuration
      if (!supabase || !supabase.auth) {
        console.error("Supabase client not properly initialized");
        return {
          success: false,
          message:
            "Authentication service unavailable. Please try again later.",
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error("Sign in error details:", error.message, error.status);

        // Log more detailed information for debugging
        if (error.message.includes("Invalid")) {
          console.log("Authentication failed: Invalid credentials");
        } else if (error.status === 0 || error.message.includes("network")) {
          console.log("Network issue detected");
        } else {
          console.log("Other authentication error:", error);
        }

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
      // First, clear local states to speed up UI response
      setState({
        session: null,
        user: null,
        isLoading: false,
      });

      // Clear any stored preferences from AsyncStorage
      const STORAGE_KEYS = [
        "kyk_yemek_selected_city",
        "kyk_yemek_selected_university",
        "kyk_yemek_selected_dorm",
        // Don't clear onboarding status to avoid forcing users to go through onboarding again
        // "kyk_yemek_onboarding_completed",
      ];

      // Remove all stored preferences
      await Promise.all(
        STORAGE_KEYS.map((key) => AsyncStorage.removeItem(key))
      );

      // Clear any session data from AsyncStorage that Supabase might be using
      const SUPABASE_KEYS = await AsyncStorage.getAllKeys();
      const supabaseKeys = SUPABASE_KEYS.filter(
        (key) =>
          key.startsWith("sb-") ||
          key.includes("supabase") ||
          key.includes("auth")
      );

      if (supabaseKeys.length > 0) {
        await Promise.all(
          supabaseKeys.map((key) => AsyncStorage.removeItem(key))
        );
      }

      // Now sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Supabase sign out error:", error);
        // Even if Supabase fails, still consider it a success since we've cleared the local state
        return true;
      }

      return true;
    } catch (err) {
      console.error("Sign out error:", err);
      // Return true anyway to ensure the user is logged out in the UI
      // This is safer than keeping them logged in when they want to log out
      return true;
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
