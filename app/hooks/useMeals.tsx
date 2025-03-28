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

  // Function to fetch a meal's ratings
  const fetchMealRatings = async (meal: Meal): Promise<Meal> => {
    if (!meal) return meal;

    try {
      // Get the meal's like/dislike counts
      const ratings = await mealService.getMealRatings(meal.id);

      // Get the user's rating for this meal if they're logged in
      let userRating = null;
      if (user) {
        userRating = await mealService.getUserMealRating(meal.id, user.id);
      }

      return {
        ...meal,
        likes: ratings.likes,
        dislikes: ratings.dislikes,
        userRating,
      };
    } catch (error) {
      console.error("Error fetching meal ratings:", error);
      return meal;
    }
  };

  // Function to rate a meal
  const rateMeal = async (mealId: number, rating: "like" | "dislike") => {
    if (!user) return false;

    try {
      // Call the backend service to rate the meal
      const newRating = await mealService.rateMeal(mealId, user.id, rating);

      // Get fresh ratings for this meal
      const ratings = await mealService.getMealRatings(mealId);

      // First, find the meal details to ensure consistent updates across both states
      let mealDate = "";
      let mealType = "";

      // Check in todayMeals first
      if (todayMeals.breakfast?.id === mealId) {
        mealDate = todayMeals.breakfast.meal_date;
        mealType = "BREAKFAST";
      } else if (todayMeals.dinner?.id === mealId) {
        mealDate = todayMeals.dinner.meal_date;
        mealType = "DINNER";
      }

      // If not found in todayMeals, check weeklyMeals
      if (!mealDate) {
        for (const day of weeklyMeals) {
          if (day.breakfast?.id === mealId) {
            mealDate = day.breakfast.meal_date;
            mealType = "BREAKFAST";
            break;
          }
          if (day.dinner?.id === mealId) {
            mealDate = day.dinner.meal_date;
            mealType = "DINNER";
            break;
          }
        }
      }

      // Update the meal in todayMeals state
      setTodayMeals((current) => {
        const updated = { ...current };

        if (updated.breakfast && updated.breakfast.id === mealId) {
          updated.breakfast = {
            ...updated.breakfast,
            likes: ratings.likes,
            dislikes: ratings.dislikes,
            userRating: newRating,
          };
        }

        if (updated.dinner && updated.dinner.id === mealId) {
          updated.dinner = {
            ...updated.dinner,
            likes: ratings.likes,
            dislikes: ratings.dislikes,
            userRating: newRating,
          };
        }

        // Also check if today's meals include the meal that was rated in the weekly view
        // by comparing meal dates and types
        if (mealDate && mealType) {
          const today = new Date().toISOString().split("T")[0];
          const mealDateStr = new Date(mealDate).toISOString().split("T")[0];

          if (mealDateStr === today) {
            if (
              mealType === "BREAKFAST" &&
              updated.breakfast &&
              updated.breakfast.id !== mealId
            ) {
              // Found a breakfast meal for the same date but different ID (data inconsistency)
              // Update it anyway to keep UI consistent
              updated.breakfast = {
                ...updated.breakfast,
                likes: ratings.likes,
                dislikes: ratings.dislikes,
                userRating: newRating,
              };
            }

            if (
              mealType === "DINNER" &&
              updated.dinner &&
              updated.dinner.id !== mealId
            ) {
              // Found a dinner meal for the same date but different ID (data inconsistency)
              // Update it anyway to keep UI consistent
              updated.dinner = {
                ...updated.dinner,
                likes: ratings.likes,
                dislikes: ratings.dislikes,
                userRating: newRating,
              };
            }
          }
        }

        return updated;
      });

      // Update the meal in weeklyMeals if it exists there
      setWeeklyMeals((current) => {
        const updated = [...current];

        updated.forEach((dailyMeal, index) => {
          if (dailyMeal.breakfast && dailyMeal.breakfast.id === mealId) {
            updated[index].breakfast = {
              ...updated[index].breakfast!,
              likes: ratings.likes,
              dislikes: ratings.dislikes,
              userRating: newRating,
            };
          }

          if (dailyMeal.dinner && dailyMeal.dinner.id === mealId) {
            updated[index].dinner = {
              ...updated[index].dinner!,
              likes: ratings.likes,
              dislikes: ratings.dislikes,
              userRating: newRating,
            };
          }

          // Also check if this daily meal is for the same date as the rated meal
          if (mealDate) {
            const mealDateStr = new Date(mealDate).toISOString().split("T")[0];
            const dailyDateStr = format(dailyMeal.date, "yyyy-MM-dd");

            if (mealDateStr === dailyDateStr) {
              if (
                mealType === "BREAKFAST" &&
                dailyMeal.breakfast &&
                dailyMeal.breakfast.id !== mealId
              ) {
                // Found a breakfast meal for the same date but different ID (data inconsistency)
                // Update it anyway to keep UI consistent
                updated[index].breakfast = {
                  ...updated[index].breakfast!,
                  likes: ratings.likes,
                  dislikes: ratings.dislikes,
                  userRating: newRating,
                };
              }

              if (
                mealType === "DINNER" &&
                dailyMeal.dinner &&
                dailyMeal.dinner.id !== mealId
              ) {
                // Found a dinner meal for the same date but different ID (data inconsistency)
                // Update it anyway to keep UI consistent
                updated[index].dinner = {
                  ...updated[index].dinner!,
                  likes: ratings.likes,
                  dislikes: ratings.dislikes,
                  userRating: newRating,
                };
              }
            }
          }
        });

        return updated;
      });

      // Return success to trigger UI refresh
      return true;
    } catch (error) {
      console.error("Error rating meal:", error);
      return false;
    }
  };

  // Prepare meal data with proper structure
  const processMeal = useCallback(
    async (meal: any): Promise<Meal> => {
      // Calculate total calories from items
      const totalCalories =
        meal.items?.reduce(
          (sum: number, item: MealItem) => sum + (item.calories || 0),
          0
        ) || 0;

      const processedMeal = {
        ...meal,
        meal_type: meal.meal_type as "BREAKFAST" | "DINNER",
        totalCalories,
        // Keep meal_items compatible with the existing structure
        meal_items: meal.items || [],
        // Ratings are now included directly from the API
        likes: meal.likes || 0,
        dislikes: meal.dislikes || 0,
        userRating: meal.userRating || null,
      };

      return processedMeal;
    },
    [user]
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
      // Pass the user ID to get their ratings in the same query
      const meals = await mealService.getTodayMeals(
        selectedCityId,
        user ? user.id : undefined
      );

      // Process meals for today
      const breakfast = meals.find((m: any) => m.meal_type === "BREAKFAST");
      const dinner = meals.find((m: any) => m.meal_type === "DINNER");

      const processedBreakfast = breakfast
        ? await processMeal(breakfast)
        : null;
      const processedDinner = dinner ? await processMeal(dinner) : null;

      setTodayMeals({
        breakfast: processedBreakfast,
        dinner: processedDinner,
      });
    } catch (err) {
      console.error("Error fetching today's meals:", err);
      setError("Yemek bilgileri alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCityId, processMeal, user]);

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

      // Fetch meals from service with user ID
      const meals = await mealService.getWeeklyMeals(
        startDateStr,
        endDateStr,
        selectedCityId,
        user ? user.id : undefined
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
          breakfast: dayBreakfast ? await processMeal(dayBreakfast) : null,
          dinner: dayDinner ? await processMeal(dayDinner) : null,
        });
      }

      setWeeklyMeals(dailyMeals);
    } catch (err) {
      console.error("Error fetching weekly meals:", err);
      setError("Haftalık yemek bilgileri alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCityId, processMeal, user]);

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
