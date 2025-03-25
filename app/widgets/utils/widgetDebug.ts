import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules } from "react-native";
import { STORAGE_KEYS } from "./widgetConstants";

/**
 * Log the current widget data stored in AsyncStorage
 * Useful for debugging widget issues
 */
export async function logWidgetData(): Promise<void> {
  try {
    const widgetData = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_DATA);
    console.log("====== WIDGET DATA ======");
    console.log(widgetData ? JSON.parse(widgetData) : "No widget data found");
    console.log("=========================");

    const lastUpdate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    console.log("Last widget update:", lastUpdate || "Never");
  } catch (error) {
    console.error("Error logging widget data:", error);
  }
}

/**
 * Get information about active widgets
 * Works on both Android and iOS
 */
export async function getWidgetInfo(): Promise<{ count: number } | null> {
  if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
    try {
      const result = await NativeModules.MealWidgetModule.getWidgetInfo();
      return result;
    } catch (error) {
      console.error("Error getting Android widget info:", error);
      return null;
    }
  } else if (Platform.OS === "ios" && NativeModules.MealWidgetService) {
    try {
      const result = await NativeModules.MealWidgetService.getWidgetInfo();
      return result;
    } catch (error) {
      console.error("Error getting iOS widget info:", error);
      return null;
    }
  } else {
    console.log("Widget info is not available on this platform");
    return null;
  }
}

/**
 * Clear widget data from AsyncStorage
 * Useful for resetting widgets during debugging
 */
export async function clearWidgetData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.WIDGET_DATA);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
    console.log("Widget data cleared from AsyncStorage");

    // Force widget update on Android
    if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
      await NativeModules.MealWidgetModule.updateWidgets();
      console.log("Android widgets updated");
    }

    // Force widget update on iOS
    if (Platform.OS === "ios" && NativeModules.MealWidgetService) {
      await NativeModules.MealWidgetService.updateWidget();
      console.log("iOS widgets updated");
    }
  } catch (error) {
    console.error("Error clearing widget data:", error);
  }
}

/**
 * Force update all widgets
 * Useful during development to test changes
 */
export async function forceUpdateWidgets(): Promise<void> {
  try {
    if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
      await NativeModules.MealWidgetModule.updateWidgets();
      console.log("Android widgets force updated");
    } else if (Platform.OS === "ios" && NativeModules.MealWidgetService) {
      await NativeModules.MealWidgetService.reloadAllTimelines();
      console.log("iOS widgets force updated");
    } else {
      console.log("Widget updates not available on this platform");
    }
  } catch (error) {
    console.error("Error forcing widget update:", error);
  }
}
