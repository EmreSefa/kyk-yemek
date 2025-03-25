import { supabase } from "../supabase";

interface MealItem {
  id?: number;
  city_menu_id?: number;
  item_name: string;
  calories?: number | null;
  description?: string | null;
}

interface CityMenu {
  id?: number;
  meal_date: string;
  meal_type: "BREAKFAST" | "DINNER";
  city_id: number;
  dorm_id: number | null;
  menu_items_text?: string;
  items?: MealItem[];
}

export const mealService = {
  /**
   * Get meals for a specific date range
   */
  async getMealsByDateRange(
    startDate: string,
    endDate: string,
    cityId?: number
  ) {
    let query = supabase
      .from("city_menus")
      .select(
        `
        id,
        meal_date,
        meal_type,
        menu_items_text,
        cities!inner(id, city_name)
      `
      )
      .gte("meal_date", startDate)
      .lte("meal_date", endDate)
      .order("meal_date")
      .order("meal_type");

    if (cityId) {
      query = query.eq("city_id", cityId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process the menu_items_text field into an array of items
    const processedMeals = data.map((meal: any) => {
      let items: MealItem[] = [];

      if (meal.menu_items_text) {
        // Split by semicolons and convert to meal items
        items = meal.menu_items_text
          .split(";")
          .map((item: string, index: number) => {
            const trimmedItem = item.trim();
            if (!trimmedItem) return null;

            // Extract calories if included in the format "Item (123 kcal)"
            let itemName = trimmedItem;
            let calories = null;

            const calorieMatch = trimmedItem.match(
              /(\d+)(?:-(\d+))?\s*(?:kalori|kcal)/i
            );
            if (calorieMatch) {
              // If there's a range like "650-850 kalori", take the average
              if (calorieMatch[2]) {
                const min = parseInt(calorieMatch[1], 10);
                const max = parseInt(calorieMatch[2], 10);
                calories = Math.floor((min + max) / 2);
              } else {
                calories = parseInt(calorieMatch[1], 10);
              }

              // Remove the calorie information from the item name
              itemName = trimmedItem
                .replace(/\s*\d+(?:-\d+)?\s*(?:kalori|kcal).*/i, "")
                .trim();
            }

            return {
              id: meal.id * 1000 + index,
              city_menu_id: meal.id,
              item_name: itemName,
              calories,
              description: null,
            };
          })
          .filter(Boolean); // Remove any null items
      }

      // Reshape the data to match the original structure but without dormitory data
      return {
        id: meal.id,
        meal_date: meal.meal_date,
        meal_type: meal.meal_type,
        menu_items_text: meal.menu_items_text,
        city_name: meal.cities ? meal.cities.city_name : null,
        city_id: meal.cities ? meal.cities.id : null,
        items,
      };
    });

    return processedMeals;
  },

  /**
   * Get today's meals for a specific city
   */
  async getTodayMeals(cityId: number) {
    const today = new Date().toISOString().split("T")[0];
    return this.getMealsByDateRange(today, today, cityId);
  },

  /**
   * Get meals for the current week for a specific city
   */
  async getWeeklyMeals(startDate: string, endDate: string, cityId: number) {
    return this.getMealsByDateRange(startDate, endDate, cityId);
  },

  /**
   * Get all cities from the database
   */
  async getCities() {
    const { data, error } = await supabase
      .from("cities")
      .select("id, city_name")
      .order("city_name");

    if (error) throw error;
    return data;
  },

  /**
   * Get universities from the database, optionally filtered by city
   */
  async getUniversities(cityId?: number) {
    let query = supabase.from("universities").select("id, name, city_id");

    if (cityId) {
      query = query.eq("city_id", cityId);
    }

    query = query.order("name");

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Get dormitories for a specific city
   */
  async getDormitories(cityId: number) {
    const { data, error } = await supabase
      .from("dormitories")
      .select("id, dorm_name, city_id, gender")
      .eq("city_id", cityId)
      .order("dorm_name");

    if (error) throw error;
    return data;
  },

  /**
   * Create a new meal using Supabase
   */
  async createMeal(cityMenu: CityMenu) {
    const { data, error } = await supabase
      .from("city_menus")
      .insert({
        meal_date: cityMenu.meal_date,
        meal_type: cityMenu.meal_type,
        city_id: cityMenu.city_id,
        dorm_id: cityMenu.dorm_id,
        menu_items_text: cityMenu.menu_items_text,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { ...cityMenu, id: data.id };
  },

  /**
   * Get meal statistics
   */
  async getMealStatistics(cityId?: number, fromDate?: string, toDate?: string) {
    let query = supabase
      .from("city_menus")
      .select("id, city_id", { count: "exact" });

    if (cityId) {
      query = query.eq("city_id", cityId);
    }

    if (fromDate) {
      query = query.gte("meal_date", fromDate);
    }

    if (toDate) {
      query = query.lte("meal_date", toDate);
    }

    const { count, error } = await query;

    if (error) throw error;

    // Get total cities count
    const { count: citiesCount, error: citiesError } = await supabase
      .from("cities")
      .select("id", { count: "exact" });

    if (citiesError) throw citiesError;

    return {
      total_meals: count || 0,
      total_cities: citiesCount || 0,
    };
  },
};
