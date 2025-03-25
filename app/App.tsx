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
    setRefreshTrigger((prev) => prev + 1);
    setCheckingOnboarding(true);
    checkOnboardingStatusAsync();
  };

  // Check if user has completed onboarding
  async function checkOnboardingStatusAsync() {
    if (!user) {
      setHasCompletedOnboarding(false);
      setCheckingOnboarding(false);
      return;
    }

    try {
      // First check for explicit onboarding completion flag
      const onboardingCompleted = await AsyncStorage.getItem(
        "kyk_yemek_onboarding_completed"
      );

      if (onboardingCompleted === "true") {
        console.log("Onboarding explicitly marked as completed");
        setHasCompletedOnboarding(true);
        setCheckingOnboarding(false);
        return;
      }

      // Try to get from AsyncStorage first (faster)
      const cityId = await AsyncStorage.getItem("kyk_yemek_selected_city");
      const dormId = await AsyncStorage.getItem("kyk_yemek_selected_dorm");

      // Consider onboarding complete if at least city and dorm are selected
      if (cityId && dormId) {
        setHasCompletedOnboarding(true);
        setCheckingOnboarding(false);

        // Mark onboarding as completed for future reference
        await AsyncStorage.setItem("kyk_yemek_onboarding_completed", "true");
        return;
      }

      // If we don't have sufficient preferences in AsyncStorage, check database
      const { data, error } = await supabase
        .from("users")
        .select("city_id, university_id, dormitory_id")
        .eq("id", user.id);

      // User record might not exist yet or might not have any preferences
      if (error) {
        console.error("Database error when fetching user preferences:", error);
        setHasCompletedOnboarding(false);
        setCheckingOnboarding(false);
        return;
      }

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
      setCheckingOnboarding(false);
    }
  }, [isAuthenticated, user, refreshTrigger]);

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
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
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
