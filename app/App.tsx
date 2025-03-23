import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { AuthProvider } from "./hooks/useAuth";
import { UserPreferencesProvider } from "./hooks/useUserPreferences";
import RootNavigator from "./navigation/RootNavigator";

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <UserPreferencesProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </UserPreferencesProvider>
    </SafeAreaProvider>
  );
}
