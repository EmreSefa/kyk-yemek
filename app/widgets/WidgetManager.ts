import { Platform, NativeModules } from "react-native";
import WidgetService from "../services/widgetService";

// Interface for Widget Manager
interface WidgetManagerInterface {
  /**
   * Initialize widgets by registering them and setting up background updates
   */
  initialize: (userId: string | null, cityId: number | null) => Promise<void>;

  /**
   * Update widget data with the latest meal information
   */
  updateWidgetData: (cityId: number) => Promise<void>;

  /**
   * Get information about active widgets
   */
  getWidgetInfo: () => Promise<{ count: number } | null>;
}

/**
 * Widget Manager to handle widget registration and updates
 * Platform-specific implementation using native modules
 */
export const WidgetManager: WidgetManagerInterface = {
  /**
   * Initialize widgets by registering them and setting up background updates
   * @param userId The current user ID or null if not authenticated
   * @param cityId The selected city ID or null if not selected
   */
  async initialize(
    userId: string | null,
    cityId: number | null
  ): Promise<void> {
    try {
      // Only proceed if authenticated and city is selected
      if (!userId || !cityId) {
        console.log(
          "Widget initialization skipped: missing user ID or city ID"
        );
        return;
      }

      // Prepare initial widget data
      await WidgetService.prepareWidgetData(cityId);

      // Setup listeners for widget data requests
      WidgetService.setupWidgetListeners();

      console.log("Widget initialization complete");
    } catch (error) {
      console.error("Widget initialization failed:", error);
    }
  },

  /**
   * Update widget data with the latest meal information
   * @param cityId The selected city ID
   */
  async updateWidgetData(cityId: number): Promise<void> {
    try {
      await WidgetService.prepareWidgetData(cityId);

      // If on Android, trigger native widget update
      if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
        await NativeModules.MealWidgetModule.updateWidgets();
      }
      // If on iOS, trigger native widget update
      else if (Platform.OS === "ios" && NativeModules.MealWidgetService) {
        await NativeModules.MealWidgetService.updateWidget();
      }

      console.log("Widget data updated successfully");
    } catch (error) {
      console.error("Widget data update failed:", error);
    }
  },

  /**
   * Get information about active widgets
   * @returns Promise resolving to widget information or null if not available
   */
  async getWidgetInfo(): Promise<{ count: number } | null> {
    try {
      if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
        const info = await NativeModules.MealWidgetModule.getWidgetInfo();
        return info;
      } else if (Platform.OS === "ios" && NativeModules.MealWidgetService) {
        const info = await NativeModules.MealWidgetService.getWidgetInfo();
        return info;
      }
      return null;
    } catch (error) {
      console.error("Error getting widget info:", error);
      return null;
    }
  },
};
