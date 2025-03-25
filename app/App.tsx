import React, { useState, useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, NavigationState } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "./navigation/types";
import { AuthProvider } from "./hooks/useAuth";
import { UserPreferencesProvider } from "./hooks/useUserPreferences";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { useColorScheme, View, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "./hooks/useAuth";
import AuthNavigator from "./navigation/AuthNavigator";
import MainTabNavigator from "./navigation/MainTabNavigator";
import OnboardingNavigator from "./navigation/OnboardingNavigator";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";

// Component to handle StatusBar style based on color scheme
function ThemeAwareStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
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
      const universityId = await AsyncStorage.getItem(
        "kyk_yemek_selected_university"
      );
      const dormId = await AsyncStorage.getItem("kyk_yemek_selected_dorm");

      console.log("Initial preferences from AsyncStorage:", {
        cityIdStr: cityId,
        universityIdStr: universityId,
        dormIdStr: dormId,
      });

      if (cityId) {
        setHasCompletedOnboarding(true);
      } else {
        console.log("User is logged in, loading preferences from database");
        // If not in AsyncStorage, check database
        const { data, error } = await supabase
          .from("users")
          .select("city_id, university_id, dormitory_id")
          .eq("id", user.id);

        // User record might not exist yet or might not have any preferences
        if (error) {
          console.error(
            "Database error when fetching user preferences:",
            error
          );
          setHasCompletedOnboarding(false);
          return;
        }

        // Check if we have any user data
        if (data && data.length > 0) {
          const userData = data[0]; // Get first user record
          // Consider onboarding complete if at least city is selected
          const hasCompleted = !!userData.city_id;
          setHasCompletedOnboarding(hasCompleted);

          // If preferences exist in DB but not in AsyncStorage, save them locally
          if (hasCompleted) {
            // Mark onboarding as completed for future reference
            await AsyncStorage.setItem(
              "kyk_yemek_onboarding_completed",
              "true"
            );

            if (userData.city_id) {
              await AsyncStorage.setItem(
                "kyk_yemek_selected_city",
                userData.city_id.toString()
              );
            }
            if (userData.university_id) {
              await AsyncStorage.setItem(
                "kyk_yemek_selected_university",
                userData.university_id.toString()
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
        }
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasCompletedOnboarding(false);
    } finally {
      setCheckingOnboarding(false);
    }
  }

  // Effect to check onboarding status when authentication changes or when the user is in onboarding flow
  useEffect(() => {
    if (isAuthenticated && user) {
      checkOnboardingStatusAsync();

      // If user is in onboarding flow, set up more frequent checks
      if (!hasCompletedOnboarding) {
        const intervalId = setInterval(() => {
          console.log("Periodic onboarding status check...");
          checkOnboardingStatusAsync();
        }, 1500); // check every 1.5 seconds while in onboarding

        return () => clearInterval(intervalId);
      }
    } else {
      setCheckingOnboarding(false);
    }
  }, [isAuthenticated, user, refreshTrigger, hasCompletedOnboarding]);

  // Effect to listen for AsyncStorage changes in onboarding completion
  useEffect(() => {
    // Create a listener for AsyncStorage changes
    const checkStorageForOnboardingCompletion = async () => {
      try {
        const completed = await AsyncStorage.getItem(
          "kyk_yemek_onboarding_completed"
        );

        // Check for all preferences when onboarding is completed
        if (completed === "true") {
          // If we need to refresh our state, do it
          if (!hasCompletedOnboarding) {
            console.log("Onboarding completion detected, refreshing app state");
            recheckOnboardingStatus();
          }
        }
      } catch (error) {
        console.error("Error checking AsyncStorage:", error);
      }
    };

    // Set up an interval to check for changes (only during development)
    const intervalId = setInterval(checkStorageForOnboardingCompletion, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [hasCompletedOnboarding]);

  // Add deep link handling for password reset
  useEffect(() => {
    // Set up deep link handling
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("Deep link received:", url);

      // Check if this is a password reset link
      if (url.includes("type=recovery")) {
        // Extract the token
        const params = url.split("#")[1];
        if (params) {
          const urlParams = new URLSearchParams(params);
          const accessToken = urlParams.get("access_token");

          if (accessToken) {
            console.log("Received password reset with access token");
            // Navigate to the ResetPassword screen
            if (navigationRef.current) {
              // @ts-ignore - we know this works
              navigationRef.current.navigate("Auth", {
                screen: "ResetPassword",
                params: { token: accessToken },
              });
            } else {
              // If navigation ref isn't ready, show an alert
              Alert.alert(
                "Şifre Sıfırlama",
                "Şifre sıfırlama bağlantısı algılandı. Lütfen uygulamayı açın ve yeni şifrenizi belirleyin.",
                [{ text: "Tamam" }]
              );
            }
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigationRef]);

  // Debug logging
  console.log("[RootNavigator] Auth state:", {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    hasSession: !!session,
    hasCompletedOnboarding,
    checkingOnboarding,
    userEmail: user?.email,
  });

  if (isLoading || (isAuthenticated && checkingOnboarding)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A6572" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth flow for non-authenticated users
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !hasCompletedOnboarding ? (
        // Onboarding flow for authenticated users who haven't completed onboarding
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        // Main flow for authenticated users who have completed onboarding
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

// Main application wrapper with all providers
export default function App() {
  const navigationRef = useRef(null);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemeAwareStatusBar />
        <NavigationContainer
          ref={navigationRef}
          onStateChange={(state) => {
            // When returning to Auth screen after onboarding completion, refresh app state
            const currentRouteName = state?.routes?.[0]?.name;
            if (currentRouteName === "Auth") {
              console.log(
                "[App] Navigation state changed to Auth, triggering recheck"
              );
              // Force a refresh of AsyncStorage values in auth state
              AsyncStorage.getItem("kyk_yemek_onboarding_completed").then(
                (completed) => {
                  if (completed === "true") {
                    console.log(
                      "[App] Onboarding marked as completed, refreshing app"
                    );
                    // This might reload parts of the app
                  }
                }
              );
            }
          }}
        >
          <AuthProvider>
            <UserPreferencesProvider>
              <RootNavigator />
            </UserPreferencesProvider>
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
