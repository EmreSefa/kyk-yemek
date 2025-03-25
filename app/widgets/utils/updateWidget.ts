import { Platform, NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { WidgetManager } from "../WidgetManager";
import { STORAGE_KEYS, UPDATE_INTERVALS } from "./widgetConstants";

/**
 * Helper function to update the widget data and trigger a refresh
 * @param cityId The selected city ID
 * @returns Promise that resolves when the update is complete
 */
export async function updateWidget(cityId: number): Promise<void> {
  try {
    if (!cityId) {
      console.warn("Cannot update widget: No city ID provided");
      return;
    }

    // Get the last update time
    const lastUpdateStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    const now = new Date();
    const currentDateStr = format(now, "yyyy-MM-dd");

    // Check if we already updated today (to avoid too many API calls)
    if (lastUpdateStr === currentDateStr) {
      console.log("Widget already updated today, skipping API call");
      return;
    }

    // Update the widget data
    await WidgetManager.updateWidgetData(cityId);

    // Store the update time
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE, currentDateStr);

    // For iOS, also save to shared UserDefaults if available
    if (Platform.OS === "ios" && NativeModules.MealWidgetService) {
      // Get the data from AsyncStorage
      const widgetData = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_DATA);

      if (widgetData) {
        try {
          // Save to shared UserDefaults
          await NativeModules.MealWidgetService.saveSharedData(
            STORAGE_KEYS.WIDGET_DATA,
            widgetData
          );
        } catch (error) {
          console.error("Error saving widget data to shared storage:", error);
        }
      }
    }

    console.log(`Widget updated successfully for city ID ${cityId}`);
  } catch (error) {
    console.error("Error updating widget:", error);
  }
}

/**
 * Schedule regular widget updates
 * @param cityId The selected city ID
 * @param interval Update interval in milliseconds (default: 6 hours)
 * @returns A cleanup function to clear the interval
 */
export function scheduleWidgetUpdates(
  cityId: number,
  interval: number = UPDATE_INTERVALS.DEFAULT
): () => void {
  // Update immediately
  updateWidget(cityId);

  // Set up interval for regular updates
  const intervalId = setInterval(() => {
    updateWidget(cityId);
  }, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
