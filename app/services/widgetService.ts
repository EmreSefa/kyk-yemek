import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules, DeviceEventEmitter } from "react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { mealService } from "../../lib/services/mealService";

// Define interfaces for meal data
interface MenuItem {
  item_name: string;
  calories?: number | null;
  description?: string | null;
}

interface MealData {
  id: number;
  meal_date: string;
  meal_type: "BREAKFAST" | "DINNER";
  menu_items_text?: string;
  city_name: string | null;
  city_id: number | null;
  items: MenuItem[];
}

interface City {
  id: number;
  city_name: string;
}

// Define the interface for widget meal data
export interface WidgetMeal {
  mealType: "BREAKFAST" | "DINNER";
  mealDate: string;
  cityName?: string;
  items: string[];
}

// Widget storage key in AsyncStorage
const WIDGET_DATA_KEY = "kyk_yemek_widget_data";

// Define the WidgetService with platform-specific implementations
const WidgetService = {
  /**
   * Get the current meal based on time of day
   * @param cityId The selected city ID
   * @returns Promise resolving to the current meal data
   */
  async getCurrentMeal(cityId: number): Promise<WidgetMeal | null> {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const today = format(now, "yyyy-MM-dd");

      // Determine if it's breakfast or dinner time
      // Breakfast: 00:01 - 11:00, Dinner: 11:00 - 00:01
      const isMealTypeBreakfast = currentHour < 11;
      const mealType = isMealTypeBreakfast ? "BREAKFAST" : "DINNER";

      // Fetch meal data from API
      // Using getTodayMeals which internally calls getMealsByDateRange
      const mealsResult = await mealService.getTodayMeals(cityId);

      if (!mealsResult || mealsResult.length === 0) {
        console.warn("No meal data available for widget");
        return null;
      }

      // Find the meal matching the current time
      const mealData = mealsResult.find(
        (meal: MealData) => meal.meal_type === mealType
      );

      if (!mealData) {
        console.warn(`No ${mealType} data available for widget`);
        return null;
      }

      // Get city name if available
      let cityName = mealData.city_name || undefined;

      // If city name wasn't in the meal data, try to get it from getCities
      if (!cityName) {
        try {
          const citiesResult = await mealService.getCities();
          const city = citiesResult.find((c: City) => c.id === cityId);
          cityName = city?.city_name;
        } catch (error) {
          console.error("Error fetching city name for widget:", error);
        }
      }

      // Format meal data for widget
      const widgetMeal: WidgetMeal = {
        mealType: mealData.meal_type,
        mealDate: today,
        cityName,
        items: mealData.items.map((item: MenuItem) => item.item_name),
      };

      return widgetMeal;
    } catch (error) {
      console.error("Error preparing widget data:", error);
      return null;
    }
  },

  /**
   * Prepare and save widget data
   * @param cityId The selected city ID
   */
  async prepareWidgetData(cityId: number): Promise<void> {
    try {
      const mealData = await this.getCurrentMeal(cityId);

      if (mealData) {
        // Store the widget data in AsyncStorage for access by widgets
        await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(mealData));

        // Update widgets on Android
        if (Platform.OS === "android") {
          this.updateAndroidWidgets();
        }
      }
    } catch (error) {
      console.error("Error preparing widget data:", error);
    }
  },

  /**
   * Updates Android widgets by sending a broadcast
   */
  updateAndroidWidgets(): void {
    if (Platform.OS === "android" && NativeModules.MealWidgetModule) {
      NativeModules.MealWidgetModule.updateWidgets()
        .then(() => console.log("Android widgets updated"))
        .catch((error: Error) =>
          console.error("Failed to update Android widgets:", error)
        );
    }
  },

  /**
   * Setup widget update listeners
   */
  setupWidgetListeners(): void {
    if (Platform.OS === "android") {
      // Listen for widget data requests from Android
      DeviceEventEmitter.addListener(
        "onWidgetDataRequest",
        async (event: any) => {
          try {
            const userPref = await AsyncStorage.getItem("userPreferences");
            if (userPref) {
              const { selectedCityId } = JSON.parse(userPref);
              if (selectedCityId) {
                await this.prepareWidgetData(selectedCityId);
              }
            }
          } catch (error) {
            console.error("Error handling widget data request:", error);
          }
        }
      );
    }
  },
};

export default WidgetService;
