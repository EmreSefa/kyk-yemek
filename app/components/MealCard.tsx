import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useMeals, MealItem, Meal } from "../hooks/useMeals";
import { useColorScheme } from "react-native";
import { MealDetailModal } from "./MealDetailModal";
import { MenuItemIcon } from "./MenuItemIcon";

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

// Helper function to filter out "500 ml su", "çeyrek ekmek", calorie info rows, and the standalone calorie row
const filterMenuItems = (items: MealItem[]): MealItem[] => {
  if (!items || items.length === 0) return [];

  // First, create a copy of the items array
  let cleanedItems = [...items];

  // Check if the last item is likely a calorie summary row (which can appear in various formats)
  if (cleanedItems.length > 0) {
    const lastItem = cleanedItems[cleanedItems.length - 1];
    if (lastItem) {
      const name = lastItem.item_name.toLowerCase().trim();

      // Check for multiple patterns that indicate a calorie row
      if (
        /^\d+\s*kcal\s*$/i.test(name) || // "750 kcal"
        /^\d+$/.test(name) || // Just a number
        name.includes("kcal") || // Contains kcal anywhere
        name.includes("kalori") || // Contains kalori
        // Empty name item with calories (as seen in screenshot)
        (name === "" && lastItem.calories && lastItem.calories > 0) ||
        // Item that only has an icon with calories value (as in screenshot)
        /^[\s\u200B]*$/.test(name) || // Only whitespace or zero-width spaces
        // For the specific case in the screenshot
        (cleanedItems.length > 1 && lastItem.calories === 750)
      ) {
        cleanedItems.pop(); // Remove the last item if it's a calorie row
      }
    }
  }

  // Then filter the remaining items
  return cleanedItems.filter((item) => {
    const name = item.item_name.toLowerCase().trim();

    // Skip empty items or items that are just whitespace
    if (!name || /^[\s\u200B]*$/.test(name)) {
      return false;
    }

    // Filter out standard excluded items
    if (
      name.includes("500 ml su") ||
      name.includes("çeyrek ekmek") ||
      name.includes("kcal") ||
      name.includes("kalori")
    ) {
      return false;
    }

    // Remove standalone calorie rows (typically just a number followed by "kcal")
    if (/^\d+\s*kcal\s*$/i.test(name)) {
      return false;
    }

    // Also filter out items that are just numbers or look like calorie values
    if (/^\d+\s*$/.test(name)) {
      return false;
    }

    // Special case: if the item has no name but has calories value
    if (name === "" && item.calories && item.calories > 0) {
      return false;
    }

    return true;
  });
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
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const handleCardPress = () => {
    if (meal) {
      setShowDetailModal(true);
    }
    // Also call the parent's onPress if provided
    if (onPress) {
      onPress();
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
  };

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

  // Get meal items from any available source and filter out unwanted items
  const allMealItems = getMealItems(meal);
  const mealItems = filterMenuItems(allMealItems);

  // Calculate total calories if not provided
  const totalCalories = meal.totalCalories || getTotalCalories(mealItems);

  return (
    <>
      <Pressable
        style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
        onPress={handleCardPress}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isDark ? styles.titleDark : styles.titleLight,
            ]}
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
                <MenuItemIcon
                  itemName={item.item_name}
                  mealType={meal.meal_type}
                  index={index}
                  size={32}
                  isCaloriesRow={false}
                />
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
              style={[
                styles.noMenu,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              Detaylı menü bilgisi bulunamadı.
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.commentsButton} onPress={handleCardPress}>
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
            <Text
              style={[
                styles.commentsButtonText,
                isDark ? styles.buttonTextDark : styles.buttonTextLight,
              ]}
            >
              Yorumlar
            </Text>
          </Pressable>

          <View style={styles.ratingContainer}>
            <Pressable
              style={[styles.ratingButton, styles.likeButton]}
              onPress={() => handleRate("like")}
              disabled={isRating}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name={
                  meal.userRating === "like" ? "thumbs-up" : "thumbs-up-outline"
                }
                size={20}
                color={
                  meal.userRating === "like"
                    ? "#4CD964"
                    : isDark
                    ? "#FFFFFF"
                    : "#000000"
                }
              />
            </Pressable>
            <Text
              style={[
                styles.ratingCount,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              {meal.likes || 0}
            </Text>
            <Pressable
              style={[styles.ratingButton, styles.dislikeButton]}
              onPress={() => handleRate("dislike")}
              disabled={isRating}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name={
                  meal.userRating === "dislike"
                    ? "thumbs-down"
                    : "thumbs-down-outline"
                }
                size={20}
                color={
                  meal.userRating === "dislike"
                    ? "#FF3B30"
                    : isDark
                    ? "#FFFFFF"
                    : "#000000"
                }
              />
            </Pressable>
            <Text
              style={[
                styles.ratingCount,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              {meal.dislikes || 0}
            </Text>
          </View>
        </View>
      </Pressable>

      {showDetailModal && (
        <MealDetailModal
          visible={true}
          mealId={meal.id}
          mealType={meal.meal_type}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 4,
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
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calories: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 2,
  },
  caloriesLight: {
    color: "#FF3B30",
  },
  caloriesDark: {
    color: "#FF9500",
  },
  content: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  itemName: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
    fontWeight: "500",
  },
  itemCalories: {
    fontSize: 12,
    fontWeight: "500",
  },
  noMenu: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 16,
  },
  textLight: {
    color: "#333333",
  },
  textDark: {
    color: "#EBEBF5",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  commentsButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  buttonTextLight: {
    color: "#000000",
  },
  buttonTextDark: {
    color: "#FFFFFF",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingButton: {
    padding: 10,
  },
  likeButton: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  dislikeButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  ratingCount: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
