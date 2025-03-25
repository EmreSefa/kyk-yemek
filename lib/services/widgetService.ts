import { mealService } from "./mealService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";

/**
 * Structure for widget data
 */
interface WidgetMeal {
  id: number;
  mealType: "BREAKFAST" | "DINNER";
  mealDate: string;
  items: string[];
  cityName: string | null;
}

/**
 * Service for handling widget-related functionality
 */
export const widgetService = {
  /**
   * Returns the appropriate meal based on current time of day
   * Breakfast: 00:01 - 11:00
   * Dinner: 11:00 - 00:01 next day
   */
  async getCurrentMeal(cityId: number | null): Promise<WidgetMeal | null> {
    if (!cityId) {
      // Attempt to get city ID from storage if not provided
      const storedCityId = await AsyncStorage.getItem(
        "kyk_yemek_selected_city"
      );
      if (!storedCityId) return null;
      cityId = parseInt(storedCityId, 10);
    }

    const now = new Date();
    const currentHour = now.getHours();
    const mealType =
      currentHour >= 0 && currentHour < 11 ? "BREAKFAST" : "DINNER";

    try {
      // Get today's meals
      const meals = await mealService.getTodayMeals(cityId);

      if (!meals || !meals.length) return null;

      // Find the meal for the current time period
      const currentMeal = meals.find((meal) => meal.meal_type === mealType);

      if (!currentMeal) return null;

      // Transform to widget-specific format
      return {
        id: currentMeal.id,
        mealType: currentMeal.meal_type as "BREAKFAST" | "DINNER",
        mealDate: currentMeal.meal_date,
        items:
          currentMeal.items?.map(
            (item: { item_name: string }) => item.item_name
          ) ||
          (currentMeal.menu_items_text
            ? currentMeal.menu_items_text
                .split(";")
                .map((item: string) => item.trim())
            : []),
        cityName: currentMeal.city_name || null,
      };
    } catch (error) {
      console.error("Error fetching current meal for widget:", error);
      return null;
    }
  },

  /**
   * Updates the widget with latest meal data
   */
  async updateWidget(): Promise<boolean> {
    try {
      const storedCityId = await AsyncStorage.getItem(
        "kyk_yemek_selected_city"
      );
      if (!storedCityId) return false;

      const cityId = parseInt(storedCityId, 10);
      const mealData = await this.getCurrentMeal(cityId);

      if (!mealData) return false;

      // Store widget data for access by the widget extension
      await AsyncStorage.setItem(
        "kyk_yemek_widget_data",
        JSON.stringify(mealData)
      );

      return true;
    } catch (error) {
      console.error("Error updating widget:", error);
      return false;
    }
  },
};
