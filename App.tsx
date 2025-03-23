import "react-native-url-polyfill/auto";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import AppNavigator from "./app/navigation/AppNavigator";
import { AuthProvider } from "./app/hooks/useAuth";

export default function App() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <AppNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
