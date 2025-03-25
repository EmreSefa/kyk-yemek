import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useUserPreferences } from "./useUserPreferences";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./useAuth";
import { mealService } from "../../lib/services/mealService";

// Define interfaces for meal data
export interface MealItem {
  id: number;
  city_menu_id: number;
  item_name: string;
  calories: number | null;
  description: string | null;
}

export interface Meal {
  id: number;
  meal_date: string;
  meal_type: "BREAKFAST" | "DINNER";
  city_id: number;
  city_name?: string;
  dorm_id: number | null;
  dorm_name?: string;
  menu_items_text?: string;
  items?: MealItem[];
  meal_items?: MealItem[];
  totalCalories?: number;
  likes?: number;
  dislikes?: number;
  userRating?: "like" | "dislike" | null;
}

export interface DailyMeals {
  date: Date;
  formatted_date: string;
  day_name: string;
  breakfast: Meal | null;
  dinner: Meal | null;
}

export const useMeals = () => {
  const { selectedCityId } = useUserPreferences();
  const { user } = useAuth();

  const [todayMeals, setTodayMeals] = useState<{
    breakfast: Meal | null;
    dinner: Meal | null;
  }>({
    breakfast: null,
    dinner: null,
  });
  const [weeklyMeals, setWeeklyMeals] = useState<DailyMeals[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRatings, setUserRatings] = useState<
    Record<number, "like" | "dislike">
  >({});

  // Load user ratings from storage
  useEffect(() => {
    const loadUserRatings = async () => {
      if (!user) return;

      try {
        const ratingsJson = await AsyncStorage.getItem(
          `menu_ratings_${user.id}`
        );
        if (ratingsJson) {
          setUserRatings(JSON.parse(ratingsJson));
        }
      } catch (err) {
        console.error("Failed to load menu ratings:", err);
      }
    };

    loadUserRatings();
  }, [user]);

  // Function to save user ratings
  const saveUserRatings = async (
    newRatings: Record<number, "like" | "dislike">
  ) => {
    if (!user) return;

    try {
      await AsyncStorage.setItem(
        `menu_ratings_${user.id}`,
        JSON.stringify(newRatings)
      );
    } catch (err) {
      console.error("Failed to save menu ratings:", err);
    }
  };

  // Function to rate a meal
  const rateMeal = async (mealId: number, rating: "like" | "dislike") => {
    if (!user) return false;

    try {
      // Check if user already rated this meal
      const currentRating = userRatings[mealId];
      let newRatings = { ...userRatings };

      if (currentRating === rating) {
        // User is toggling off their rating
        delete newRatings[mealId];
      } else {
        // User is setting or changing their rating
        newRatings[mealId] = rating;
      }

      // Update state
      setUserRatings(newRatings);

      // Save ratings to AsyncStorage
      await saveUserRatings(newRatings);

      // Update any relevant meals in state
      setTodayMeals((prev) => {
        const updatedMeals = { ...prev };

        if (updatedMeals.breakfast && updatedMeals.breakfast.id === mealId) {
          updatedMeals.breakfast = {
            ...updatedMeals.breakfast,
            userRating: newRatings[mealId] || null,
            likes:
              (updatedMeals.breakfast.likes || 0) +
              (currentRating !== "like" && newRatings[mealId] === "like"
                ? 1
                : currentRating === "like" && !newRatings[mealId]
                ? -1
                : 0),
            dislikes:
              (updatedMeals.breakfast.dislikes || 0) +
              (currentRating !== "dislike" && newRatings[mealId] === "dislike"
                ? 1
                : currentRating === "dislike" && !newRatings[mealId]
                ? -1
                : 0),
          };
        }

        if (updatedMeals.dinner && updatedMeals.dinner.id === mealId) {
          updatedMeals.dinner = {
            ...updatedMeals.dinner,
            userRating: newRatings[mealId] || null,
            likes:
              (updatedMeals.dinner.likes || 0) +
              (currentRating !== "like" && newRatings[mealId] === "like"
                ? 1
                : currentRating === "like" && !newRatings[mealId]
                ? -1
                : 0),
            dislikes:
              (updatedMeals.dinner.dislikes || 0) +
              (currentRating !== "dislike" && newRatings[mealId] === "dislike"
                ? 1
                : currentRating === "dislike" && !newRatings[mealId]
                ? -1
                : 0),
          };
        }

        return updatedMeals;
      });

      setWeeklyMeals((prev) => {
        return prev.map((dailyMeal) => {
          const updatedDaily = { ...dailyMeal };

          if (updatedDaily.breakfast && updatedDaily.breakfast.id === mealId) {
            updatedDaily.breakfast = {
              ...updatedDaily.breakfast,
              userRating: newRatings[mealId] || null,
              likes:
                (updatedDaily.breakfast.likes || 0) +
                (currentRating !== "like" && newRatings[mealId] === "like"
                  ? 1
                  : currentRating === "like" && !newRatings[mealId]
                  ? -1
                  : 0),
              dislikes:
                (updatedDaily.breakfast.dislikes || 0) +
                (currentRating !== "dislike" && newRatings[mealId] === "dislike"
                  ? 1
                  : currentRating === "dislike" && !newRatings[mealId]
                  ? -1
                  : 0),
            };
          }

          if (updatedDaily.dinner && updatedDaily.dinner.id === mealId) {
            updatedDaily.dinner = {
              ...updatedDaily.dinner,
              userRating: newRatings[mealId] || null,
              likes:
                (updatedDaily.dinner.likes || 0) +
                (currentRating !== "like" && newRatings[mealId] === "like"
                  ? 1
                  : currentRating === "like" && !newRatings[mealId]
                  ? -1
                  : 0),
              dislikes:
                (updatedDaily.dinner.dislikes || 0) +
                (currentRating !== "dislike" && newRatings[mealId] === "dislike"
                  ? 1
                  : currentRating === "dislike" && !newRatings[mealId]
                  ? -1
                  : 0),
            };
          }

          return updatedDaily;
        });
      });

      return true;
    } catch (error) {
      console.error("Error rating meal:", error);
      return false;
    }
  };

  // Prepare meal data with proper structure
  const processMeal = useCallback(
    (meal: any): Meal => {
      // Calculate total calories from items
      const totalCalories =
        meal.items?.reduce(
          (sum: number, item: MealItem) => sum + (item.calories || 0),
          0
        ) || 0;

      return {
        ...meal,
        meal_type: meal.meal_type as "BREAKFAST" | "DINNER",
        // Add default likes/dislikes for UI
        likes: Math.floor(Math.random() * 30) + 5, // Random values for demonstration
        dislikes: Math.floor(Math.random() * 10),
        userRating: userRatings[meal.id] || null,
        totalCalories,
        // Keep meal_items compatible with the existing structure
        meal_items: meal.items || [],
      };
    },
    [userRatings]
  );

  // Fetch today's meals
  const fetchTodayMeals = useCallback(async () => {
    if (!selectedCityId) {
      setTodayMeals({ breakfast: null, dinner: null });
      setError("Lütfen bir şehir seçin");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Only pass cityId, not dormId since there's no relationship
      const meals = await mealService.getTodayMeals(selectedCityId);

      // Process meals for today
      const breakfast = meals.find((m: any) => m.meal_type === "BREAKFAST");
      const dinner = meals.find((m: any) => m.meal_type === "DINNER");

      setTodayMeals({
        breakfast: breakfast ? processMeal(breakfast) : null,
        dinner: dinner ? processMeal(dinner) : null,
      });
    } catch (err) {
      console.error("Error fetching today's meals:", err);
      setError("Yemek bilgileri alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCityId, processMeal]);

  // Fetch weekly meals
  const fetchWeeklyMeals = useCallback(async () => {
    if (!selectedCityId) {
      setWeeklyMeals([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate week start and end
      const today = new Date();
      const startDate = startOfWeek(today, { weekStartsOn: 1 });
      const endDate = addDays(startDate, 6);

      // Format dates for query
      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");

      // Fetch meals from service - only pass cityId, not dormId
      const meals = await mealService.getWeeklyMeals(
        startDateStr,
        endDateStr,
        selectedCityId
      );

      // Process into daily structure
      const dailyMeals: DailyMeals[] = [];

      // Create an entry for each day of the week
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        const dateStr = format(date, "yyyy-MM-dd");

        // Find meals for this day
        const dayBreakfast = meals.find(
          (m: any) => m.meal_date === dateStr && m.meal_type === "BREAKFAST"
        );

        const dayDinner = meals.find(
          (m: any) => m.meal_date === dateStr && m.meal_type === "DINNER"
        );

        dailyMeals.push({
          date,
          formatted_date: format(date, "d MMMM", { locale: tr }),
          day_name: format(date, "EEEE", { locale: tr }),
          breakfast: dayBreakfast ? processMeal(dayBreakfast) : null,
          dinner: dayDinner ? processMeal(dayDinner) : null,
        });
      }

      setWeeklyMeals(dailyMeals);
    } catch (err) {
      console.error("Error fetching weekly meals:", err);
      setError("Haftalık yemek bilgileri alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCityId, processMeal]);

  // Fetch meals when city or dorm changes
  useEffect(() => {
    fetchTodayMeals();
    fetchWeeklyMeals();
  }, [fetchTodayMeals, fetchWeeklyMeals]);

  // Helper function to check if a date is today
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  return {
    todayMeals,
    weeklyMeals,
    isLoading,
    error,
    fetchTodayMeals,
    fetchWeeklyMeals,
    rateMeal,
    isToday,
  };
};
