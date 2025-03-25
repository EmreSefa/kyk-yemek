import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase";

// Storage keys
const NOTIFICATION_ENABLED_KEY = "@kykyemek:notifications_enabled";
const BREAKFAST_NOTIFICATION_KEY = "@kykyemek:breakfast_notification";
const DINNER_NOTIFICATION_KEY = "@kykyemek:dinner_notification";

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Helper function to create a compatible trigger format from Date
function createTriggerFromDate(date: Date): any {
  // For immediate testing, use a seconds-based trigger with a short delay
  if (date.getTime() - new Date().getTime() < 5000) {
    return { seconds: 5 }; // 5 seconds delay for immediate testing
  }

  // For normal scheduling, use a seconds-based trigger
  const secondsUntilTrigger = Math.max(
    1,
    Math.floor((date.getTime() - new Date().getTime()) / 1000)
  );
  return { seconds: secondsUntilTrigger };
}

// Permission request
export async function registerForNotificationsAsync() {
  let token;

  // Create channel for Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("meal-reminders", {
      name: "Meal Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Check if physical device
  if (!Constants.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return null;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return null;
  }

  // Get Expo push token (though we're using local notifications, this is for future use)
  try {
    // Based on Expo documentation, we need the projectId from app config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (projectId) {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      token = tokenData.data;
    }
  } catch (error) {
    console.error("Error getting push token:", error);
  }

  return token;
}

// Schedule notifications based on user preferences
export async function scheduleNotifications() {
  try {
    // First check if notifications are enabled
    const notificationsEnabled = await AsyncStorage.getItem(
      NOTIFICATION_ENABLED_KEY
    );
    if (notificationsEnabled === "false") {
      return;
    }

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Check breakfast notification setting
    const breakfastEnabled = await AsyncStorage.getItem(
      BREAKFAST_NOTIFICATION_KEY
    );
    if (breakfastEnabled !== "false") {
      await scheduleBreakfastNotification();
    }

    // Check dinner notification setting
    const dinnerEnabled = await AsyncStorage.getItem(DINNER_NOTIFICATION_KEY);
    if (dinnerEnabled !== "false") {
      await scheduleDinnerNotification();
    }

    console.log("Notifications scheduled successfully");
  } catch (error) {
    console.error("Error scheduling notifications:", error);
  }
}

// Get today's meal information from Supabase
async function getTodayMeal(mealType: "breakfast" | "dinner") {
  try {
    // Get user preferences
    const dormId = await AsyncStorage.getItem("kyk_yemek_selected_dorm");

    if (!dormId) {
      return null; // Can't fetch meals without dormitory selection
    }

    // Get dormitory info to get city_id
    const { data: dormData } = await supabase
      .from("dormitories")
      .select("city_id")
      .eq("id", dormId)
      .single();

    if (!dormData?.city_id) {
      console.error("Could not find city_id for dormitory");
      return null;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Query city_menus table
    const { data, error } = await supabase
      .from("city_menus")
      .select("*")
      .eq("date", today)
      .eq("city_id", dormData.city_id)
      .eq("meal_type", mealType)
      .single();

    if (error) {
      console.error(`Error fetching ${mealType} menu:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error in getTodayMeal for ${mealType}:`, error);
    return null;
  }
}

// Format meal items into a readable string
function formatMealItems(meal: any, mealType: "breakfast" | "dinner"): string {
  if (!meal || !meal.menu_items_text) {
    return mealType === "breakfast"
      ? "Bugünkü kahvaltı menüsünü görmek için tıklayın"
      : "Bugünkü akşam yemeği menüsünü görmek için tıklayın";
  }

  try {
    // Split the menu_items_text by semicolons
    const items = meal.menu_items_text
      .split(";")
      .map((item: string) => item.trim())
      .filter(Boolean);

    // Take first 6 items for breakfast or first 4 for dinner
    const itemLimit = mealType === "breakfast" ? 6 : 4;
    const displayItems = items.slice(0, itemLimit);

    // Join items with commas
    return displayItems.join(", ");
  } catch (error) {
    console.error("Error formatting meal items:", error);
    return mealType === "breakfast"
      ? "Bugünkü kahvaltı menüsünü görmek için tıklayın"
      : "Bugünkü akşam yemeği menüsünü görmek için tıklayın";
  }
}

// Schedule breakfast notification for 7 AM daily
async function scheduleBreakfastNotification() {
  try {
    // Try to get today's breakfast menu
    const breakfastMeal = await getTodayMeal("breakfast");
    const mealText = formatMealItems(breakfastMeal, "breakfast");

    // Create date objects for scheduling
    // First notification for today if it's before 7 AM, otherwise for tomorrow
    const now = new Date();
    const notificationTime = new Date();

    // Set to 7 AM
    notificationTime.setHours(7, 0, 0, 0);

    // If it's already past 7 AM, schedule for tomorrow
    if (now.getTime() > notificationTime.getTime()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    // Create a compatible trigger using our helper function
    const trigger = createTriggerFromDate(notificationTime);

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Kahvaltı 🍳",
        body: mealText,
        data: {
          type: "breakfast",
          mealId: breakfastMeal?.id,
        },
      },
      trigger,
    });

    console.log(
      `Breakfast notification scheduled for ${notificationTime.toLocaleString()} with ID: ${notificationId}`
    );
  } catch (error) {
    console.error("Error scheduling breakfast notification:", error);
    // Fallback to generic notification on error
    try {
      // Use simpler trigger to avoid errors
      const now = new Date();
      const notificationTime = new Date();

      // Set to 7 AM
      notificationTime.setHours(7, 0, 0, 0);

      // If it's already past 7 AM, schedule for tomorrow
      if (now.getTime() > notificationTime.getTime()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      // Create a compatible trigger using our helper function
      const trigger = createTriggerFromDate(notificationTime);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Kahvaltı 🍳",
          body: "Bugünkü kahvaltı menüsünü görmek için tıklayın",
          data: { type: "breakfast" },
        },
        trigger,
      });
    } catch (innerError) {
      console.error(
        "Failed to schedule fallback breakfast notification:",
        innerError
      );
    }
  }
}

// Schedule dinner notification for 4 PM daily
async function scheduleDinnerNotification() {
  try {
    // Try to get today's dinner menu
    const dinnerMeal = await getTodayMeal("dinner");
    const mealText = formatMealItems(dinnerMeal, "dinner");

    // Create date objects for scheduling
    // First notification for today if it's before 4 PM, otherwise for tomorrow
    const now = new Date();
    const notificationTime = new Date();

    // Set to 4 PM (16:00)
    notificationTime.setHours(16, 0, 0, 0);

    // If it's already past 4 PM, schedule for tomorrow
    if (now.getTime() > notificationTime.getTime()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    // Create a compatible trigger using our helper function
    const trigger = createTriggerFromDate(notificationTime);

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Akşam Yemeği 🍽️",
        body: mealText,
        data: {
          type: "dinner",
          mealId: dinnerMeal?.id,
        },
      },
      trigger,
    });

    console.log(
      `Dinner notification scheduled for ${notificationTime.toLocaleString()} with ID: ${notificationId}`
    );
  } catch (error) {
    console.error("Error scheduling dinner notification:", error);
    // Fallback to generic notification on error
    try {
      // Use simpler trigger to avoid errors
      const now = new Date();
      const notificationTime = new Date();

      // Set to 4 PM (16:00)
      notificationTime.setHours(16, 0, 0, 0);

      // If it's already past 4 PM, schedule for tomorrow
      if (now.getTime() > notificationTime.getTime()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      // Create a compatible trigger using our helper function
      const trigger = createTriggerFromDate(notificationTime);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Akşam Yemeği 🍽️",
          body: "Bugünkü akşam yemeği menüsünü görmek için tıklayın",
          data: { type: "dinner" },
        },
        trigger,
      });
    } catch (innerError) {
      console.error(
        "Failed to schedule fallback dinner notification:",
        innerError
      );
    }
  }
}

// Function to send a test notification immediately - useful for development
export async function sendTestNotification(title?: string, body?: string) {
  try {
    const mealType = Math.random() > 0.5 ? "breakfast" : "dinner";
    const defaultTitle =
      mealType === "breakfast" ? "Kahvaltı 🍳" : "Akşam Yemeği 🍽️";

    // Sample menu items
    const breakfastItems =
      "Çay;Peynir;Zeytin;Bal;Tereyağı;Yumurta;Domates;Salatalık";
    const dinnerItems = "Mercimek Çorbası;Pilav;Tavuk Şiş;Salata";

    const sampleMenu =
      mealType === "breakfast"
        ? breakfastItems.split(";").slice(0, 6).join(", ")
        : dinnerItems.split(";").slice(0, 4).join(", ");

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title || defaultTitle,
        body: body || sampleMenu,
        data: { type: "test" },
      },
      trigger: null, // null trigger means send immediately
    });
    console.log("Test notification sent successfully with ID:", notificationId);
    return true;
  } catch (error) {
    console.error("Error sending test notification:", error);
    return false;
  }
}

// Get all active notification settings
export async function getNotificationSettings() {
  try {
    const notificationsEnabled =
      (await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY)) !== "false";
    const breakfastEnabled =
      (await AsyncStorage.getItem(BREAKFAST_NOTIFICATION_KEY)) !== "false";
    const dinnerEnabled =
      (await AsyncStorage.getItem(DINNER_NOTIFICATION_KEY)) !== "false";

    return {
      notificationsEnabled,
      breakfastEnabled,
      dinnerEnabled,
    };
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return {
      notificationsEnabled: true,
      breakfastEnabled: true,
      dinnerEnabled: true,
    };
  }
}

// Update notification settings
export async function updateNotificationSettings(settings: {
  notificationsEnabled?: boolean;
  breakfastEnabled?: boolean;
  dinnerEnabled?: boolean;
}) {
  try {
    if (settings.notificationsEnabled !== undefined) {
      await AsyncStorage.setItem(
        NOTIFICATION_ENABLED_KEY,
        settings.notificationsEnabled ? "true" : "false"
      );
    }

    if (settings.breakfastEnabled !== undefined) {
      await AsyncStorage.setItem(
        BREAKFAST_NOTIFICATION_KEY,
        settings.breakfastEnabled ? "true" : "false"
      );
    }

    if (settings.dinnerEnabled !== undefined) {
      await AsyncStorage.setItem(
        DINNER_NOTIFICATION_KEY,
        settings.dinnerEnabled ? "true" : "false"
      );
    }

    // If notifications are enabled, reschedule based on new settings
    const notificationsEnabled =
      settings.notificationsEnabled !== undefined
        ? settings.notificationsEnabled
        : (await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY)) !== "false";

    if (notificationsEnabled) {
      // Reschedule notifications based on new settings
      await scheduleNotifications();
    } else {
      // Cancel all notifications if they've been disabled
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    return true;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return false;
  }
}

// Check if notifications have been set up for first app run
export async function checkNotificationsInitialized() {
  try {
    const initialized = await AsyncStorage.getItem(
      "@kykyemek:notifications_initialized"
    );
    return initialized === "true";
  } catch {
    return false;
  }
}

// Mark notifications as initialized
export async function markNotificationsInitialized() {
  try {
    await AsyncStorage.setItem("@kykyemek:notifications_initialized", "true");
  } catch (error) {
    console.error("Error marking notifications as initialized:", error);
  }
}

// Handle notification response - can be expanded for deep linking
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
) {
  const data = response.notification.request.content.data;
  console.log("Notification clicked:", data);

  // You can add navigation or other logic here based on notification type
  // Example: if (data.type === 'breakfast') { navigate to breakfast screen }
}
