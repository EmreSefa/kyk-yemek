import React, { useState, useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  useColorScheme,
  View,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "./navigation/types";
import { AuthProvider } from "./hooks/useAuth";
import {
  UserPreferencesProvider,
  useUserPreferences,
} from "./hooks/useUserPreferences";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import {
  NotificationProvider,
  useNotifications,
} from "./hooks/useNotifications";
import { useAuth } from "./hooks/useAuth";
import AuthNavigator from "./navigation/AuthNavigator";
import MainTabNavigator from "./navigation/MainTabNavigator";
import OnboardingNavigator from "./navigation/OnboardingNavigator";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WidgetManager } from "./widgets/WidgetManager";
import { UPDATE_INTERVALS } from "./widgets/utils/widgetConstants";

// Component to handle StatusBar style based on color scheme
function ThemeAwareStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

// Component to initialize notifications when the app is ready
function NotificationInitializer() {
  const { initializeNotifications } = useNotifications();

  useEffect(() => {
    // Initialize notifications
    const setupNotifications = async () => {
      await initializeNotifications();
    };

    setupNotifications();
  }, []);

  return null; // This component doesn't render anything
}

// Component to initialize widgets when the app is ready
function WidgetInitializer() {
  const { selectedCityId } = useUserPreferences();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Initialize widgets only if authenticated and city is selected
    if (isAuthenticated && selectedCityId && user?.id) {
      // Initialize widgets with user ID and selected city
      WidgetManager.initialize(user.id, selectedCityId)
        .then(() => console.log("Widgets initialized successfully"))
        .catch((error) =>
          console.error("Widget initialization failed:", error)
        );

      // Set up periodic updates
      const updateInterval = UPDATE_INTERVALS.DEFAULT; // 6 hours
      const intervalId = setInterval(() => {
        WidgetManager.updateWidgetData(selectedCityId).catch((error) =>
          console.error("Widget update failed:", error)
        );
      }, updateInterval);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, selectedCityId, user]);

  return null; // This component doesn't render anything
}

const Stack = createStackNavigator<RootStackParamList>();

// Root navigation component with authentication state
function RootNavigator() {
  const { isAuthenticated, isLoading, user, session } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigationRef = useRef(null);

  // Force reload of the component when needed
  const recheckOnboardingStatus = () => {
    console.log("Forcing onboarding status recheck...");
    setRefreshTrigger((prev) => prev + 1);
    setCheckingOnboarding(true);
    checkOnboardingStatusAsync();
  };

  // Function to listen for onboarding completion event
  useEffect(() => {
    if (isAuthenticated && user) {
      const checkOnboardingInterval = setInterval(async () => {
        const onboardingCompleted = await AsyncStorage.getItem(
          "kyk_yemek_onboarding_completed"
        );
        if (onboardingCompleted === "true" && !hasCompletedOnboarding) {
          console.log("Detected onboarding completion, refreshing...");
          recheckOnboardingStatus();
          clearInterval(checkOnboardingInterval);
        }
      }, 1000); // Check every second if onboarding was completed

      return () => clearInterval(checkOnboardingInterval);
    }
  }, [isAuthenticated, user, hasCompletedOnboarding]);

  // Check if user has completed onboarding
  async function checkOnboardingStatusAsync() {
    if (!user) {
      setHasCompletedOnboarding(false);
      setCheckingOnboarding(false);
      return;
    }

    try {
      console.log("Checking onboarding status for user:", user.id);

      // Try to get user preferences from AsyncStorage first (faster)
      const [cityIdStr, dormIdStr, onboardingCompleted] = await Promise.all([
        AsyncStorage.getItem("kyk_yemek_selected_city"),
        AsyncStorage.getItem("kyk_yemek_selected_dorm"),
        AsyncStorage.getItem("kyk_yemek_onboarding_completed"),
      ]);

      console.log(
        "Initial preferences from AsyncStorage:",
        JSON.stringify({ cityIdStr, dormIdStr, onboardingCompleted })
      );

      // If we have preferences in AsyncStorage, use them
      if (cityIdStr && dormIdStr && onboardingCompleted === "true") {
        console.log("Found complete preferences in AsyncStorage");
        setHasCompletedOnboarding(true);
        setCheckingOnboarding(false);
        return;
      }

      // If not in AsyncStorage, check Supabase for user preferences
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching user preferences:", error);
        setHasCompletedOnboarding(false);
        setCheckingOnboarding(false);
        return;
      }

      console.log("Fetched user preferences:", data);

      // Check if we have any user data
      if (data && data.length > 0) {
        const userData = data[0]; // Get first user record
        // Consider onboarding complete if at least city and dormitory are selected
        const hasCompleted = !!userData.city_id && !!userData.dormitory_id;
        setHasCompletedOnboarding(hasCompleted);
        setCheckingOnboarding(false);

        // If preferences exist in DB but not in AsyncStorage, save them locally
        if (hasCompleted) {
          // Mark onboarding as completed for future reference
          await AsyncStorage.setItem("kyk_yemek_onboarding_completed", "true");

          if (userData.city_id) {
            await AsyncStorage.setItem(
              "kyk_yemek_selected_city",
              userData.city_id.toString()
            );
          }
          if (userData.dormitory_id) {
            await AsyncStorage.setItem(
              "kyk_yemek_selected_dorm",
              userData.dormitory_id.toString()
            );
          }
        }
      } else {
        // No user data found, need to go through onboarding
        console.log("No user preferences found in database");
        setHasCompletedOnboarding(false);
        setCheckingOnboarding(false);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasCompletedOnboarding(false);
      setCheckingOnboarding(false);
    }
  }

  // Effect to check onboarding status when authentication changes
  useEffect(() => {
    if (isAuthenticated && user) {
      checkOnboardingStatusAsync();
    } else {
      // Clear onboarding state when user logs out
      setHasCompletedOnboarding(false);
      setCheckingOnboarding(false);
    }
  }, [isAuthenticated, user, refreshTrigger]);

  // Effect to reset navigation when user logs out
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // User has logged out, ensure we're showing the Auth navigator
      setHasCompletedOnboarding(false);
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || (isAuthenticated && checkingOnboarding)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A6572" />
      </View>
    );
  }

  // Determine the initial route
  let initialRoute: "Auth" | "Main" | "Onboarding" = "Auth";

  if (isAuthenticated) {
    initialRoute = hasCompletedOnboarding ? "Main" : "Onboarding";
    console.log(`[RootNavigator] Setting initial route to: ${initialRoute}`);
  }

  return (
    <>
      <ThemeAwareStatusBar />
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        {isAuthenticated ? (
          // Show either Main or Onboarding screens when authenticated
          <>
            {hasCompletedOnboarding ? (
              <Stack.Screen name="Main" component={MainTabNavigator} />
            ) : (
              <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
            )}
          </>
        ) : (
          // Show Auth screen when not authenticated
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ animationTypeForReplace: "pop" }}
          />
        )}
      </Stack.Navigator>
      <NotificationInitializer />
      <WidgetInitializer />
    </>
  );
}

// Main application wrapper with all providers
export default function App() {
  const navigationRef = useRef(null);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserPreferencesProvider>
            <NotificationProvider>
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
              </NavigationContainer>
            </NotificationProvider>
          </UserPreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
