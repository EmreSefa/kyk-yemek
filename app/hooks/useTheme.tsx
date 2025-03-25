import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme types
type ThemeMode = "light" | "dark";

// Context props
interface ThemeContextProps {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Create context
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Theme storage key
const THEME_STORAGE_KEY = "kyk_yemek_theme_mode";

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get device theme
  const deviceTheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          setThemeState(savedTheme);
        } else {
          // Use device theme as default if no saved preference
          setThemeState(deviceTheme === "dark" ? "dark" : "light");
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
        // Fallback to device theme
        setThemeState(deviceTheme === "dark" ? "dark" : "light");
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Save theme preference when it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch((error) => {
        console.error("Failed to save theme preference:", error);
      });
    }
  }, [theme, isLoading]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Set theme explicitly
  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const value = {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
