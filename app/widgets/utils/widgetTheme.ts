import AsyncStorage from "@react-native-async-storage/async-storage";
import { WidgetConfig } from "../models/WidgetData";
import { Platform, NativeModules } from "react-native";

// Default theme colors
const LIGHT_THEME: WidgetConfig = {
  backgroundColor: "#FFFFFF",
  textColor: "#333333",
  accentColor: "#4CAF50",
};

const DARK_THEME: WidgetConfig = {
  backgroundColor: "#1E1E1E",
  textColor: "#E0E0E0",
  accentColor: "#7CCC80",
};

/**
 * Get the theme configuration for widgets
 * @param isDarkMode Whether to use dark mode
 * @returns Widget theme configuration
 */
export async function getWidgetTheme(
  isDarkMode?: boolean
): Promise<WidgetConfig> {
  try {
    // Check if we should determine dark mode from user preferences
    if (isDarkMode === undefined) {
      // Try to get theme preference from AsyncStorage
      const themePreference = await AsyncStorage.getItem("theme_preference");
      isDarkMode = themePreference === "dark";

      // If no preference is set, use system default if available
      if (
        !themePreference &&
        Platform.OS === "android" &&
        NativeModules.ThemeModule
      ) {
        try {
          isDarkMode = await NativeModules.ThemeModule.isSystemInDarkMode();
        } catch (error) {
          console.error("Error checking system dark mode:", error);
        }
      }
    }

    return isDarkMode ? DARK_THEME : LIGHT_THEME;
  } catch (error) {
    console.error("Error getting widget theme:", error);
    return LIGHT_THEME; // Fallback to light theme
  }
}

/**
 * Update widget theme based on app theme changes
 * @param isDarkMode Whether dark mode is enabled
 */
export async function updateWidgetTheme(isDarkMode: boolean): Promise<void> {
  try {
    const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

    // Get current widget data
    const widgetDataStr = await AsyncStorage.getItem("kyk_yemek_widget_data");
    if (widgetDataStr) {
      const widgetData = JSON.parse(widgetDataStr);

      // Update theme config
      widgetData.config = theme;

      // Save updated data
      await AsyncStorage.setItem(
        "kyk_yemek_widget_data",
        JSON.stringify(widgetData)
      );

      // Update widgets
      if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
        await NativeModules.MealWidgetModule.updateWidgets();
      }
    }
  } catch (error) {
    console.error("Error updating widget theme:", error);
  }
}
