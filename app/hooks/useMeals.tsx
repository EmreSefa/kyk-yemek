import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { useUserPreferences } from "./useUserPreferences";

// Define interfaces for meal data
export interface MealItem {
  id: number;
  meal_id: number;
  item_name: string;
  calories: number | null;
  description: string | null;
}

export interface Meal {
  id: number;
  meal_date: string;
  meal_type: "BREAKFAST" | "DINNER";
  city_id: number;
  dorm_id: number | null;
  meal_items: MealItem[];
}

export interface DailyMeals {
  date: Date;
  formatted_date: string;
  day_name: string;
  breakfast: Meal | null;
  dinner: Meal | null;
}

export const useMeals = () => {
  const { selectedCityId, selectedDormId } = useUserPreferences();

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

  // Function to fetch today's meals
  const fetchTodayMeals = async () => {
    try {
      if (!selectedCityId) {
        setError("Lütfen şehir seçiniz");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");

      // Query to get today's meals with their items
      const { data, error } = await supabase
        .from("meals")
        .select(
          `
          id,
          meal_date,
          meal_type,
          city_id,
          dorm_id,
          meal_items (
            id,
            meal_id,
            item_name,
            calories,
            description
          )
        `
        )
        .eq("meal_date", formattedDate)
        .eq("city_id", selectedCityId)
        .order("meal_type");

      if (error) {
        console.error("Error fetching today meals:", error);
        setError("Yemek bilgileri alınamadı, lütfen tekrar deneyin.");
        return;
      }

      // Filter by dorm if provided
      const filteredMeals = selectedDormId
        ? data?.filter(
            (meal) => meal.dorm_id === selectedDormId || meal.dorm_id === null
          )
        : data;

      // Organize meals by type
      let breakfast = null;
      let dinner = null;

      filteredMeals?.forEach((meal) => {
        if (meal.meal_type === "BREAKFAST") {
          breakfast = meal as Meal;
        } else if (meal.meal_type === "DINNER") {
          dinner = meal as Meal;
        }
      });

      setTodayMeals({
        breakfast,
        dinner,
      });
    } catch (err) {
      console.error("Failed to fetch today meals:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch weekly meals
  const fetchWeeklyMeals = async () => {
    try {
      if (!selectedCityId) {
        setError("Lütfen şehir seçiniz");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // Calculate date range for the current week
      const today = new Date();
      const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
      const dateRange = Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(startDate, i);
        return format(date, "yyyy-MM-dd");
      });

      // Fetch meals for the entire week
      const { data, error } = await supabase
        .from("meals")
        .select(
          `
          id,
          meal_date,
          meal_type,
          city_id,
          dorm_id,
          meal_items (
            id,
            meal_id,
            item_name,
            calories,
            description
          )
        `
        )
        .in("meal_date", dateRange)
        .eq("city_id", selectedCityId)
        .order("meal_date")
        .order("meal_type");

      if (error) {
        console.error("Error fetching weekly meals:", error);
        setError("Haftalık yemek bilgileri alınamadı, lütfen tekrar deneyin.");
        return;
      }

      // Filter by dorm if provided
      const filteredMeals = selectedDormId
        ? data?.filter(
            (meal) => meal.dorm_id === selectedDormId || meal.dorm_id === null
          )
        : data;

      // Organize meals by day and type
      const weekMeals: DailyMeals[] = dateRange.map((dateStr) => {
        const date = new Date(dateStr);
        const dayMeals = filteredMeals?.filter(
          (meal) => meal.meal_date === dateStr
        );

        let breakfast = null;
        let dinner = null;

        dayMeals?.forEach((meal) => {
          if (meal.meal_type === "BREAKFAST") {
            breakfast = meal as Meal;
          } else if (meal.meal_type === "DINNER") {
            dinner = meal as Meal;
          }
        });

        return {
          date,
          formatted_date: format(date, "d MMMM", { locale: tr }),
          day_name: format(date, "EEEE", { locale: tr }),
          breakfast,
          dinner,
        };
      });

      setWeeklyMeals(weekMeals);
    } catch (err) {
      console.error("Failed to fetch weekly meals:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh meals when location preferences change
  useEffect(() => {
    fetchTodayMeals();
  }, [selectedCityId, selectedDormId]);

  // Check if a date is today
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  return {
    todayMeals,
    weeklyMeals,
    isLoading,
    error,
    fetchTodayMeals,
    fetchWeeklyMeals,
    isToday,
    selectedCityId,
    selectedDormId,
  };
};
