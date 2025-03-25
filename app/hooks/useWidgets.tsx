import { useEffect, useCallback } from "react";
import { Platform } from "react-native";
import {
  setupWidgetEventListeners,
  triggerWidgetUpdate,
} from "../widgets/utils/widgetEvents";
import { scheduleWidgetUpdates } from "../widgets/utils/updateWidget";
import { WidgetManager } from "../widgets/WidgetManager";
import { UPDATE_INTERVALS } from "../widgets/utils/widgetConstants";

/**
 * Hook for managing widget updates and lifecycle
 * @param params Parameters for widget management
 * @param params.cityId The selected city ID
 * @param params.userId The authenticated user ID
 * @param params.isAuthenticated Whether the user is authenticated
 * @returns Widget management functions
 */
export function useWidgets({
  cityId,
  userId,
  isAuthenticated,
}: {
  cityId: number | null;
  userId: string | null;
  isAuthenticated: boolean;
}) {
  // Initialize widgets on mount
  useEffect(() => {
    let cleanupScheduler: (() => void) | null = null;
    let cleanupListeners: (() => void) | null = null;

    const initializeWidgets = async () => {
      if (isAuthenticated && cityId && userId) {
        try {
          // Initialize widgets
          await WidgetManager.initialize(userId, cityId);

          // Set up event listeners
          cleanupListeners = setupWidgetEventListeners();

          // Schedule regular updates
          cleanupScheduler = scheduleWidgetUpdates(
            cityId,
            UPDATE_INTERVALS.DEFAULT
          );

          console.log("Widgets initialized successfully");
        } catch (error) {
          console.error("Failed to initialize widgets:", error);
        }
      }
    };

    initializeWidgets();

    // Cleanup function
    return () => {
      if (cleanupScheduler) cleanupScheduler();
      if (cleanupListeners) cleanupListeners();
    };
  }, [isAuthenticated, cityId, userId]);

  // Function to manually update widgets
  const updateWidgets = useCallback(async () => {
    if (cityId) {
      await triggerWidgetUpdate(cityId);
    }
  }, [cityId]);

  // Check if widgets are supported
  const areWidgetsSupported =
    Platform.OS === "android" || Platform.OS === "ios";

  return {
    updateWidgets,
    areWidgetsSupported,
  };
}
