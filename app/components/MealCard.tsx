import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useMeals, MealItem, Meal } from "../hooks/useMeals";
import { useColorScheme } from "react-native";

// Helper function to get all meal items, checking all possible sources
const getMealItems = (meal: Meal | null): MealItem[] => {
  if (!meal) return [];

  if (meal?.items && Array.isArray(meal.items) && meal.items.length > 0) {
    return meal.items;
  }

  if (
    meal?.meal_items &&
    Array.isArray(meal.meal_items) &&
    meal.meal_items.length > 0
  ) {
    return meal.meal_items;
  }

  // Try to parse menu_items_text as a fallback
  if (meal?.menu_items_text) {
    try {
      // Simple parsing for items in format "Item name (123 kcal)"
      return meal.menu_items_text
        .split("\n")
        .filter((line: string) => line.trim().length > 0)
        .map((line: string, index: number) => {
          // Try to extract calories from parentheses
          const calorieMatch = line.match(/\((\d+)\s*kcal\)/i);
          const calories = calorieMatch ? parseInt(calorieMatch[1], 10) : null;

          // Remove the calorie part to get clean item name
          const itemName = line.replace(/\(\d+\s*kcal\)/i, "").trim();

          return {
            id: -index - 1, // Generate negative IDs for parsed items
            city_menu_id: meal.id,
            item_name: itemName,
            calories,
            description: null,
          };
        });
    } catch (error) {
      console.error("Error parsing menu_items_text:", error);
      return [];
    }
  }

  return [];
};

// Helper function to calculate total calories
const getTotalCalories = (items: MealItem[]): number => {
  return items.reduce((sum, item) => sum + (item.calories || 0), 0);
};

interface MealCardProps {
  meal: Meal | null;
  mealType: string;
  onRateMeal?: (mealId: number, rating: "like" | "dislike") => Promise<boolean>;
  isLoading?: boolean;
  onPress?: () => void;
}

export function MealCard({
  meal,
  mealType,
  onRateMeal,
  isLoading = false,
  onPress,
}: MealCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isRating, setIsRating] = useState(false);

  // Helper to get the meal type title in Turkish
  const getMealTypeTitle = () => {
    return mealType === "BREAKFAST" ? "Kahvaltı" : "Akşam Yemeği";
  };

  // Handle when user clicks like or dislike
  const handleRate = useCallback(
    async (rating: "like" | "dislike") => {
      if (!meal || isRating || !onRateMeal) return;

      setIsRating(true);
      try {
        await onRateMeal(meal.id, rating);
      } catch (error) {
        console.error("Failed to rate meal:", error);
      } finally {
        setIsRating(false);
      }
    },
    [meal, isRating, onRateMeal]
  );

  // If loading, show placeholder
  if (isLoading) {
    return (
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isDark ? styles.titleDark : styles.titleLight,
            ]}
          >
            {getMealTypeTitle()}
          </Text>
        </View>
        <View style={styles.content}>
          <Text
            style={[styles.noMenu, isDark ? styles.textDark : styles.textLight]}
          >
            Yemek menüsü yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  // If no meal data, show placeholder
  if (!meal) {
    return (
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isDark ? styles.titleDark : styles.titleLight,
            ]}
          >
            {getMealTypeTitle()}
          </Text>
        </View>
        <View style={styles.content}>
          <Text
            style={[styles.noMenu, isDark ? styles.textDark : styles.textLight]}
          >
            Bu öğün için yemek bilgisi bulunamadı.
          </Text>
        </View>
      </View>
    );
  }

  // Get meal items from any available source
  const mealItems = getMealItems(meal);

  // Calculate total calories if not provided
  const totalCalories = meal.totalCalories || getTotalCalories(mealItems);

  return (
    <Pressable
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text
          style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}
        >
          {getMealTypeTitle()}
        </Text>
        <View style={styles.calorieContainer}>
          <Ionicons
            name="flame"
            size={14}
            color={isDark ? "#FF9500" : "#FF3B30"}
          />
          <Text
            style={[
              styles.calories,
              isDark ? styles.caloriesDark : styles.caloriesLight,
            ]}
          >
            {totalCalories} kcal
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {mealItems.length > 0 ? (
          mealItems.map((item, index) => (
            <View key={item.id || index} style={styles.menuItem}>
              <Text
                style={[
                  styles.itemName,
                  isDark ? styles.textDark : styles.textLight,
                ]}
              >
                {item.item_name}
              </Text>
              {item.calories && (
                <Text
                  style={[
                    styles.itemCalories,
                    isDark ? styles.textDark : styles.textLight,
                  ]}
                >
                  {item.calories} kcal
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text
            style={[styles.noMenu, isDark ? styles.textDark : styles.textLight]}
          >
            Detaylı menü bilgisi bulunamadı.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.ratingButton,
            meal?.userRating === "like" && styles.ratingButtonActive,
          ]}
          disabled={isRating}
          onPress={() => handleRate("like")}
        >
          <Ionicons
            name={
              meal?.userRating === "like" ? "thumbs-up" : "thumbs-up-outline"
            }
            size={16}
            color={
              meal?.userRating === "like"
                ? "#34C759"
                : isDark
                ? "#FFFFFF"
                : "#8E8E93"
            }
          />
          <Text
            style={[
              styles.ratingText,
              isDark ? styles.ratingTextDark : styles.ratingTextLight,
              meal?.userRating === "like" && styles.ratingTextActive,
            ]}
          >
            {meal?.likes || 0}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.ratingButton,
            meal?.userRating === "dislike" && styles.ratingButtonActive,
          ]}
          disabled={isRating}
          onPress={() => handleRate("dislike")}
        >
          <Ionicons
            name={
              meal?.userRating === "dislike"
                ? "thumbs-down"
                : "thumbs-down-outline"
            }
            size={16}
            color={
              meal?.userRating === "dislike"
                ? "#FF3B30"
                : isDark
                ? "#FFFFFF"
                : "#8E8E93"
            }
          />
          <Text
            style={[
              styles.ratingText,
              isDark ? styles.ratingTextDark : styles.ratingTextLight,
              meal?.userRating === "dislike" && styles.ratingTextActive,
            ]}
          >
            {meal?.dislikes || 0}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardLight: {
    backgroundColor: "#FFFFFF",
  },
  cardDark: {
    backgroundColor: "#1C1C1E",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  titleLight: {
    color: "#000000",
  },
  titleDark: {
    color: "#FFFFFF",
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calories: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  caloriesLight: {
    color: "#FF3B30",
  },
  caloriesDark: {
    color: "#FF9500",
  },
  content: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemCalories: {
    fontSize: 14,
    marginLeft: 8,
  },
  noMenu: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 16,
  },
  textLight: {
    color: "#000000",
  },
  textDark: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8,
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  ratingButtonActive: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  ratingTextLight: {
    color: "#8E8E93",
  },
  ratingTextDark: {
    color: "#FFFFFF",
  },
  ratingTextActive: {
    color: "#8E8E93",
  },
});
