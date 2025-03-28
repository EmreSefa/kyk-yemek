import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import Constants from "expo-constants";

// Get the environment variables
// First try from Constants.expoConfig.extra, then from process.env
const getEnvVariable = (key: string): string => {
  // First check in Constants (for EAS builds and direct deploys)
  const expoConstant = Constants.expoConfig?.extra?.[key];
  if (expoConstant) return expoConstant;

  // Then check in process.env (for local development)
  const processEnv = process.env[key];
  if (processEnv) return processEnv;

  // Fallback to hardcoded values (not recommended for production, but helps for debugging)
  const fallbackValues: Record<string, string> = {
    EXPO_PUBLIC_SUPABASE_URL: "https://nofdsioamusfrlkavjst.supabase.co",
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZmRzaW9hbXVzZnJsa2F2anN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTkzOTQsImV4cCI6MjA1ODMzNTM5NH0.qWsU2jxK7pAfQRtVg2mWdTPDBIrtioUL2T7Y22iv2wY",
  };

  const fallbackValue = fallbackValues[key];
  if (fallbackValue) {
    console.log(`Using fallback value for ${key}`);
    return fallbackValue;
  }

  console.error(`Missing environment variable: ${key}`);
  return "";
};

const supabaseUrl = getEnvVariable("EXPO_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVariable("EXPO_PUBLIC_SUPABASE_ANON_KEY");

// Log for debugging (remove in production)
console.log(`Supabase URL: ${supabaseUrl ? "Set" : "Not set"}`);
console.log(`Supabase Anon Key: ${supabaseAnonKey ? "Set" : "Not set"}`);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
