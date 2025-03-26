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
    cityId?: number,
    userId?: string
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
    let processedMeals = data.map((meal: any) => {
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

        // Filter out "500 ml su" and "çeyrek ekmek"
        items = items.filter((item: MealItem) => {
          const name = item.item_name.toLowerCase();
          return !name.includes("500 ml su") && !name.includes("çeyrek ekmek");
        });
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
        likes: 0, // Default values, will be updated
        dislikes: 0, // Default values, will be updated
        userRating: null, // Default value, will be updated if userId provided
      };
    });

    // If userId is provided, fetch the user's ratings for all these meals in a single query
    if (userId) {
      const mealIds = processedMeals.map((meal: any) => meal.id);

      // Get the user's ratings for these meals
      const { data: userRatings, error: ratingsError } = await supabase
        .from("meal_ratings")
        .select("meal_id, rating")
        .eq("user_id", userId)
        .in("meal_id", mealIds);

      if (ratingsError) throw ratingsError;

      // Create a map of meal_id to rating for quick lookup
      const userRatingsMap: Record<number, "like" | "dislike"> = {};
      if (userRatings) {
        userRatings.forEach((rating: any) => {
          userRatingsMap[rating.meal_id] = rating.rating as "like" | "dislike";
        });
      }

      // Fetch like/dislike counts for all meals at once
      const likeCountsPromises = mealIds.map(async (mealId: number) => {
        const ratings = await this.getMealRatings(mealId);
        return { mealId, ...ratings };
      });

      const likeCounts = await Promise.all(likeCountsPromises);
      const likeCountsMap: Record<number, { likes: number; dislikes: number }> =
        {};
      likeCounts.forEach((item) => {
        likeCountsMap[item.mealId] = {
          likes: item.likes,
          dislikes: item.dislikes,
        };
      });

      // Update each meal with its ratings info
      processedMeals = processedMeals.map((meal: any) => {
        return {
          ...meal,
          likes: likeCountsMap[meal.id]?.likes || 0,
          dislikes: likeCountsMap[meal.id]?.dislikes || 0,
          userRating: userRatingsMap[meal.id] || null,
        };
      });
    }

    return processedMeals;
  },

  /**
   * Get today's meals for a specific city
   */
  async getTodayMeals(cityId: number, userId?: string) {
    const today = new Date().toISOString().split("T")[0];
    return this.getMealsByDateRange(today, today, cityId, userId);
  },

  /**
   * Get meals for the current week for a specific city
   */
  async getWeeklyMeals(
    startDate: string,
    endDate: string,
    cityId: number,
    userId?: string
  ) {
    return this.getMealsByDateRange(startDate, endDate, cityId, userId);
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

  /**
   * Rate a meal (like or dislike)
   */
  async rateMeal(
    mealId: number,
    userId: string,
    rating: "like" | "dislike" | null
  ) {
    // Check if the user has already rated this meal
    const { data: existingRating, error: fetchError } = await supabase
      .from("meal_ratings")
      .select("id, rating")
      .eq("meal_id", mealId)
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows found", which is expected if user hasn't rated yet
      throw fetchError;
    }

    // If user is toggling off their rating (clicking the same button again)
    if (existingRating && existingRating.rating === rating) {
      // Delete the rating
      const { error: deleteError } = await supabase
        .from("meal_ratings")
        .delete()
        .eq("id", existingRating.id);

      if (deleteError) throw deleteError;

      return null;
    }

    // If user has an existing rating but is changing it, or adding a new rating
    if (existingRating) {
      // Update the existing rating
      const { error: updateError } = await supabase
        .from("meal_ratings")
        .update({ rating })
        .eq("id", existingRating.id);

      if (updateError) throw updateError;
    } else if (rating) {
      // Insert a new rating
      const { error: insertError } = await supabase
        .from("meal_ratings")
        .insert({
          meal_id: mealId,
          user_id: userId,
          rating,
        });

      if (insertError) throw insertError;
    }

    return rating;
  },

  /**
   * Get ratings for a meal
   */
  async getMealRatings(mealId: number) {
    // Get the count of likes
    const { count: likeCount, error: likeError } = await supabase
      .from("meal_ratings")
      .select("*", { count: "exact" })
      .eq("meal_id", mealId)
      .eq("rating", "like");

    if (likeError) throw likeError;

    // Get the count of dislikes
    const { count: dislikeCount, error: dislikeError } = await supabase
      .from("meal_ratings")
      .select("*", { count: "exact" })
      .eq("meal_id", mealId)
      .eq("rating", "dislike");

    if (dislikeError) throw dislikeError;

    return {
      likes: likeCount || 0,
      dislikes: dislikeCount || 0,
    };
  },

  /**
   * Get user's rating for a meal
   */
  async getUserMealRating(mealId: number, userId: string) {
    const { data, error } = await supabase
      .from("meal_ratings")
      .select("rating")
      .eq("meal_id", mealId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data ? (data.rating as "like" | "dislike") : null;
  },

  /**
   * Add a comment to a meal
   */
  async addComment(mealId: number, userId: string, comment: string) {
    const { data, error } = await supabase
      .from("meal_comments")
      .insert({
        meal_id: mealId,
        user_id: userId,
        comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all comments for a meal
   */
  async getMealComments(mealId: number, userId?: string) {
    try {
      // Build the query
      let query = supabase
        .from("meal_comments")
        .select(
          `
          id,
          meal_id,
          user_id,
          comment,
          created_at,
          profiles:user_id(display_name, avatar_url)
        `
        )
        .eq("meal_id", mealId)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Return the data with profiles included from the join
      return data;
    } catch (error) {
      console.error("Error in getMealComments:", error);
      throw error;
    }
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: number, userId: string, comment: string) {
    const { data, error } = await supabase
      .from("meal_comments")
      .update({ comment, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("user_id", userId) // Ensure only the user can update their own comment
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number, userId: string) {
    const { error } = await supabase
      .from("meal_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId); // Ensure only the user can delete their own comment

    if (error) throw error;
    return true;
  },

  /**
   * Admin only: Approve a comment
   */
  async approveComment(commentId: number, approved: boolean) {
    const { data, error } = await supabase
      .from("meal_comments")
      .update({ is_approved: approved, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
