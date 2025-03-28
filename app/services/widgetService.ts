import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, NativeModules, DeviceEventEmitter } from "react-native";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { mealService } from "../../lib/services/mealService";
import {
  WidgetMeal as WidgetMealModel,
  WidgetStorageData,
} from "../widgets/models/WidgetData";
import {
  STORAGE_KEYS,
  MEAL_TIME_RANGES,
} from "../widgets/utils/widgetConstants";
import api from "./api";

// Define interfaces for meal data
interface MenuItem {
  id?: number;
  city_menu_id?: number;
  item_name: string;
  calories?: number | null;
  description?: string | null;
}

interface MealData {
  id: number;
  meal_date: string;
  meal_type: "BREAKFAST" | "DINNER";
  menu_items_text?: string;
  city_name?: string | null;
  city_id?: number | null;
  items?: MenuItem[];
}

interface City {
  id: number;
  city_name: string;
}

// Define the legacy interface for widget meal data
interface LegacyWidgetMeal {
  mealType: "BREAKFAST" | "DINNER";
  mealDate: string;
  cityName?: string;
  items: string[];
}

// Define TTL for meal cache in milliseconds (30 minutes)
const MEAL_CACHE_TTL = 30 * 60 * 1000;

// Widget storage key in AsyncStorage
const WIDGET_DATA_KEY = "kyk_yemek_widget_data";
const MEAL_CACHE_KEY = "kyk_yemek_meal_cache";

// Define the WidgetService with platform-specific implementations
const WidgetService = {
  /**
   * Get the current meal based on time of day
   * @param cityId The selected city ID
   * @returns Promise resolving to the current meal data
   */
  async getCurrentMeal(cityId: number): Promise<LegacyWidgetMeal | null> {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const today = format(now, "yyyy-MM-dd");

      // Determine if it's breakfast or dinner time
      // Breakfast: 00:01 - 11:00, Dinner: 11:00 - 00:01
      const isMealTypeBreakfast = currentHour < 11;
      const mealType = isMealTypeBreakfast ? "BREAKFAST" : "DINNER";

      // Check if we have cached meal data
      const cachedMealData = await this.getCachedMeals(cityId, today);
      let mealsResult;

      if (cachedMealData) {
        mealsResult = cachedMealData;
      } else {
        // Fetch meal data from API
        mealsResult = await mealService.getTodayMeals(cityId);

        // Cache the results
        await this.cacheMeals(cityId, today, mealsResult);
      }

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
          const city = citiesResult.find((c: any) => c.id === cityId);
          cityName = city?.city_name;
        } catch (error) {
          console.error("Error fetching city name for widget:", error);
        }
      }

      // Format meal data for widget
      const widgetMeal: LegacyWidgetMeal = {
        mealType: mealData.meal_type,
        mealDate: today,
        cityName,
        items: mealData.items?.map((item: MenuItem) => item.item_name) || [],
      };

      return widgetMeal;
    } catch (error) {
      console.error("Error preparing widget data:", error);
      return null;
    }
  },

  /**
   * Get cached meal data if available and not expired
   */
  async getCachedMeals(
    cityId: number,
    date: string
  ): Promise<MealData[] | null> {
    try {
      const cacheKey = `${MEAL_CACHE_KEY}_${cityId}_${date}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (!cachedData) return null;

      const { data, timestamp } = JSON.parse(cachedData);

      // Check if cache is still valid (within TTL)
      if (Date.now() - timestamp < MEAL_CACHE_TTL) {
        return data;
      }

      return null;
    } catch (error) {
      console.error("Error reading meal cache:", error);
      return null;
    }
  },

  /**
   * Cache meal data for future use
   */
  async cacheMeals(
    cityId: number,
    date: string,
    data: MealData[]
  ): Promise<void> {
    try {
      const cacheKey = `${MEAL_CACHE_KEY}_${cityId}_${date}`;
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Error caching meal data:", error);
    }
  },

  /**
   * Prepare widget data by fetching from API and storing in AsyncStorage
   * @param cityId The ID of the selected city
   */
  async prepareWidgetData(cityId: number): Promise<void> {
    try {
      if (!cityId) {
        console.warn("Cannot prepare widget data: No city ID provided");
        return;
      }

      // Get current date and format it
      const now = new Date();
      const currentDate = format(now, "yyyy-MM-dd");
      const currentHour = now.getHours();

      // Determine the active meal type based on time of day
      let activeMealType: "breakfast" | "lunch" | "dinner" = "lunch";

      if (
        currentHour >= MEAL_TIME_RANGES.BREAKFAST.START &&
        currentHour < MEAL_TIME_RANGES.BREAKFAST.END
      ) {
        activeMealType = "breakfast";
      } else if (
        currentHour >= MEAL_TIME_RANGES.LUNCH.START &&
        currentHour < MEAL_TIME_RANGES.LUNCH.END
      ) {
        activeMealType = "lunch";
      } else if (
        currentHour >= MEAL_TIME_RANGES.DINNER.START &&
        currentHour < MEAL_TIME_RANGES.DINNER.END
      ) {
        activeMealType = "dinner";
      }

      try {
        // Instead of using the API, use mealService which has the correct schema
        let mealData: MealData[] = [];

        try {
          // Get today's meals directly from mealService
          mealData = await mealService.getTodayMeals(cityId);
          console.log("Successfully fetched today's meals from mealService");
        } catch (innerError) {
          console.error("Error fetching from mealService:", innerError);
          // Fallback to empty data
          mealData = [];
        }

        // Get city data
        let cityName = "Unknown Location";
        try {
          const cities = await mealService.getCities();
          const city = cities.find((c) => c.id === cityId);
          if (city) {
            cityName = city.city_name;
          }
        } catch (cityError) {
          console.error("Error fetching city data:", cityError);
        }

        // Process meal data
        const meals: { [key: string]: WidgetMealModel } = {
          breakfast: {
            mealType: "breakfast",
            date: currentDate,
            menu: [],
            location: cityName,
            hasData: false,
          },
          lunch: {
            mealType: "lunch",
            date: currentDate,
            menu: [],
            location: cityName,
            hasData: false,
          },
          dinner: {
            mealType: "dinner",
            date: currentDate,
            menu: [],
            location: cityName,
            hasData: false,
          },
        };

        // Process breakfast data
        const breakfastData = mealData.find(
          (meal) => meal.meal_type === "BREAKFAST"
        );
        if (
          breakfastData &&
          breakfastData.items &&
          breakfastData.items.length > 0
        ) {
          meals.breakfast = {
            mealType: "breakfast",
            date: currentDate,
            menu: breakfastData.items.map((item: MenuItem) => item.item_name),
            location: cityName,
            hasData: true,
          };
        }

        // Process dinner data
        const dinnerData = mealData.find((meal) => meal.meal_type === "DINNER");
        if (dinnerData && dinnerData.items && dinnerData.items.length > 0) {
          meals.dinner = {
            mealType: "dinner",
            date: currentDate,
            menu: dinnerData.items.map((item: MenuItem) => item.item_name),
            location: cityName,
            hasData: true,
          };
        }

        // Create widget storage data object
        const widgetData: WidgetStorageData = {
          lastUpdate: currentDate,
          cityId,
          location: cityName,
          meals,
          config: {
            backgroundColor: "#FFFFFF",
            textColor: "#000000",
            accentColor: "#4CAF50",
          },
        };

        // Store in AsyncStorage
        await AsyncStorage.setItem(
          STORAGE_KEYS.WIDGET_DATA,
          JSON.stringify(widgetData)
        );
        console.log("Widget data prepared and stored successfully");
      } catch (apiError) {
        console.error("API Error in widget data preparation:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("Failed to prepare widget data:", error);

      // Store empty data in case of failure
      const emptyWidgetData: WidgetStorageData = {
        lastUpdate: format(new Date(), "yyyy-MM-dd"),
        cityId,
        location: "Unknown Location",
        meals: {
          breakfast: {
            mealType: "breakfast",
            date: format(new Date(), "yyyy-MM-dd"),
            menu: [],
            location: "Unknown Location",
            hasData: false,
          },
          lunch: {
            mealType: "lunch",
            date: format(new Date(), "yyyy-MM-dd"),
            menu: [],
            location: "Unknown Location",
            hasData: false,
          },
          dinner: {
            mealType: "dinner",
            date: format(new Date(), "yyyy-MM-dd"),
            menu: [],
            location: "Unknown Location",
            hasData: false,
          },
        },
        config: {
          backgroundColor: "#FFFFFF",
          textColor: "#000000",
          accentColor: "#4CAF50",
        },
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.WIDGET_DATA,
        JSON.stringify(emptyWidgetData)
      );
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
   * Set up event listeners for widget data requests
   */
  setupWidgetListeners(): void {
    // This is handled by the widgetEvents.ts utility now
    console.log("Widget listeners are now managed by widgetEvents.ts utility");
  },

  /**
   * Get the current widget data from AsyncStorage
   * @returns The current widget data or null if not available
   */
  async getCurrentWidgetData(): Promise<WidgetStorageData | null> {
    try {
      const dataStr = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_DATA);
      if (!dataStr) return null;

      return JSON.parse(dataStr) as WidgetStorageData;
    } catch (error) {
      console.error("Failed to get current widget data:", error);
      return null;
    }
  },

  /**
   * Clear all widget data
   * Used for logout or debugging
   */
  async clearWidgetData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WIDGET_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
      console.log("Widget data cleared successfully");
    } catch (error) {
      console.error("Failed to clear widget data:", error);
    }
  },
};

export default WidgetService;
