import { Platform, DeviceEventEmitter, NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateWidget } from "./updateWidget";
import { STORAGE_KEYS } from "./widgetConstants";

/**
 * Sets up listeners for widget-related events
 * @returns Function to clean up listeners
 */
export function setupWidgetEventListeners(): () => void {
  const listeners: { remove: () => void }[] = [];

  // Listen for widget data requests from Android
  if (Platform.OS === "android") {
    const listener = DeviceEventEmitter.addListener(
      "onWidgetDataRequest",
      async (event) => {
        try {
          // Get city ID from user preferences
          const userPref = await AsyncStorage.getItem("userPreferences");
          if (userPref) {
            const { selectedCityId } = JSON.parse(userPref);
            if (selectedCityId) {
              await updateWidget(selectedCityId);
            }
          }
        } catch (error) {
          console.error("Error handling widget data request:", error);
        }
      }
    );

    listeners.push(listener);
  }

  // Return cleanup function
  return () => {
    listeners.forEach((listener) => listener.remove());
  };
}

/**
 * Trigger a manual widget update
 * @param cityId The selected city ID
 */
export async function triggerWidgetUpdate(cityId: number): Promise<void> {
  if (!cityId) {
    console.warn("Cannot update widget: No city ID provided");
    return;
  }

  try {
    await updateWidget(cityId);

    // Send update to Android
    if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
      await NativeModules.MealWidgetModule.updateWidgets();
    }
  } catch (error) {
    console.error("Failed to trigger widget update:", error);
  }
}
