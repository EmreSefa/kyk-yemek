import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Pressable,
  useColorScheme,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useMeals, Meal, MealItem } from "../../hooks/useMeals";
import { Ionicons } from "@expo/vector-icons";
import { CommentsSection } from "../../components/CommentsSection";
import { MenuItemIcon } from "../../components/MenuItemIcon";

interface MealDetailScreenProps {
  mealId: number;
  mealType: string;
  onClose: () => void;
}

// Define types for our flattened data structure
interface InfoData {
  date: string;
  calories: number;
}

interface RatingData {
  likes: number;
  dislikes: number;
  userRating: "like" | "dislike" | null | undefined;
}

interface CommentData {
  mealId: number;
}

type SectionHeaderItem = {
  id: string;
  type: "sectionHeader";
  title: string;
  sectionType: string;
};

type DataItem = {
  id: string;
  type: "info" | "menu" | "rating" | "comments";
  data: InfoData | MealItem | RatingData | CommentData;
};

type FlattenedItem = SectionHeaderItem | DataItem;

export function MealDetailScreen({
  mealId,
  mealType,
  onClose,
}: MealDetailScreenProps) {
  const { todayMeals, weeklyMeals, rateMeal } = useMeals();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Find the meal from either today's meals or weekly meals
  const findMeal = (): Meal | null => {
    // Check in today's meals
    if (mealType === "BREAKFAST" && todayMeals.breakfast?.id === mealId) {
      return todayMeals.breakfast;
    }
    if (mealType === "DINNER" && todayMeals.dinner?.id === mealId) {
      return todayMeals.dinner;
    }

    // Check in weekly meals
    for (const day of weeklyMeals) {
      if (day.breakfast?.id === mealId) {
        return day.breakfast;
      }
      if (day.dinner?.id === mealId) {
        return day.dinner;
      }
    }

    return null;
  };

  const meal = findMeal();

  // Helper function to get all meal items
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

    return [];
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

  // Get all meal items and filter out unwanted items
  const allMealItems = getMealItems(meal);
  const mealItems = filterMenuItems(allMealItems);

  // Handle when user clicks like or dislike
  const handleRate = async (rating: "like" | "dislike") => {
    if (!meal) return;
    await rateMeal(meal.id, rating);
  };

  if (!meal) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onClose}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </Pressable>
          <Text
            style={[
              styles.headerTitle,
              isDark ? styles.textDark : styles.textLight,
            ]}
          >
            Yemek Detayı
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          <Text
            style={[
              styles.noMealText,
              isDark ? styles.textDark : styles.textLight,
            ]}
          >
            Yemek bilgisi bulunamadı.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Define sections for FlatList
  const sections = [
    {
      type: "info",
      data: [
        {
          date: new Date(meal.meal_date).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          calories: meal.totalCalories || 0,
        },
      ],
    },
    {
      type: "menu",
      title: "Menü",
      data: mealItems,
    },
    {
      type: "rating",
      title: "Beğeni",
      data: [
        {
          likes: meal.likes || 0,
          dislikes: meal.dislikes || 0,
          userRating: meal.userRating || null,
        },
      ],
    },
    {
      type: "comments",
      data: [{ mealId: meal.id }],
    },
  ];

  // Flatten the sections for the FlatList
  const flattenedData: FlattenedItem[] = sections.reduce(
    (acc: FlattenedItem[], section) => {
      // Add section header
      if (section.title) {
        acc.push({
          id: `header-${section.type}`,
          type: "sectionHeader",
          title: section.title,
          sectionType: section.type,
        });
      }

      // Add section items with type
      section.data.forEach((item, index) => {
        acc.push({
          id: `${section.type}-${index}`,
          type: section.type as "info" | "menu" | "rating" | "comments",
          data: item,
        });
      });

      return acc;
    },
    []
  );

  const renderItem = ({ item }: { item: FlattenedItem }) => {
    if (item.type === "sectionHeader") {
      return (
        <Text
          style={[
            styles.sectionTitle,
            isDark ? styles.textDark : styles.textLight,
          ]}
        >
          {item.title}
        </Text>
      );
    }

    switch (item.type) {
      case "info": {
        const infoData = item.data as InfoData;
        return (
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.dateText,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              {infoData.date}
            </Text>
            <View style={styles.calorieContainer}>
              <Ionicons
                name="flame"
                size={16}
                color={isDark ? "#FF9500" : "#FF3B30"}
              />
              <Text
                style={[
                  styles.calorieText,
                  isDark ? styles.calorieDark : styles.calorieLight,
                ]}
              >
                {infoData.calories} kcal
              </Text>
            </View>
          </View>
        );
      }

      case "menu": {
        const menuItem = item.data as MealItem;
        return (
          <View style={styles.menuItem}>
            <MenuItemIcon
              itemName={menuItem.item_name}
              mealType={meal.meal_type}
              index={parseInt(item.id.split("-")[1])}
              size={24}
              isCaloriesRow={false}
            />
            <Text
              style={[
                styles.itemName,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              {menuItem.item_name}
            </Text>
            {menuItem.calories && (
              <Text
                style={[
                  styles.itemCalories,
                  isDark ? styles.textDark : styles.textLight,
                ]}
              >
                {menuItem.calories} kcal
              </Text>
            )}
          </View>
        );
      }

      case "rating": {
        const ratingData = item.data as RatingData;
        return (
          <View style={styles.ratingButtons}>
            <Pressable
              style={[
                styles.ratingButton,
                ratingData.userRating === "like" && styles.ratingButtonActive,
              ]}
              onPress={() => handleRate("like")}
            >
              <Ionicons
                name={
                  ratingData.userRating === "like"
                    ? "thumbs-up"
                    : "thumbs-up-outline"
                }
                size={24}
                color={
                  ratingData.userRating === "like"
                    ? isDark
                      ? "#FFFFFF"
                      : "#007AFF"
                    : isDark
                    ? "#BBBBBB"
                    : "#666666"
                }
              />
              <Text
                style={[
                  styles.ratingText,
                  ratingData.userRating === "like" && styles.ratingTextActive,
                  isDark && styles.ratingTextDark,
                ]}
              >
                {ratingData.likes} Beğenme
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.ratingButton,
                ratingData.userRating === "dislike" &&
                  styles.ratingButtonActive,
              ]}
              onPress={() => handleRate("dislike")}
            >
              <Ionicons
                name={
                  ratingData.userRating === "dislike"
                    ? "thumbs-down"
                    : "thumbs-down-outline"
                }
                size={24}
                color={
                  ratingData.userRating === "dislike"
                    ? isDark
                      ? "#FFFFFF"
                      : "#007AFF"
                    : isDark
                    ? "#BBBBBB"
                    : "#666666"
                }
              />
              <Text
                style={[
                  styles.ratingText,
                  ratingData.userRating === "dislike" &&
                    styles.ratingTextActive,
                  isDark && styles.ratingTextDark,
                ]}
              >
                {ratingData.dislikes} Beğenmeme
              </Text>
            </Pressable>
          </View>
        );
      }

      case "comments": {
        const commentData = item.data as CommentData;
        return (
          <View style={styles.commentsContainer}>
            <CommentsSection mealId={commentData.mealId} />
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onClose}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#FFFFFF" : "#000000"}
          />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            isDark ? styles.textDark : styles.textLight,
          ]}
        >
          {mealType === "BREAKFAST" ? "Kahvaltı" : "Akşam Yemeği"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <FlatList
          style={styles.container}
          contentContainerStyle={styles.content}
          data={flattenedData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
        />
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  calorieText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 4,
  },
  calorieLight: {
    color: "#FF3B30",
  },
  calorieDark: {
    color: "#FF9500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  itemName: {
    fontSize: 17,
    flex: 1,
    marginRight: 8,
    fontWeight: "500",
  },
  itemCalories: {
    fontSize: 14,
    fontWeight: "500",
  },
  noMenuText: {
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 24,
  },
  ratingButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    margin: 4,
  },
  ratingButtonActive: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666666",
  },
  ratingTextActive: {
    color: "#007AFF",
    fontWeight: "500",
  },
  ratingTextDark: {
    color: "#BBBBBB",
  },
  textLight: {
    color: "#000000",
  },
  textDark: {
    color: "#FFFFFF",
  },
  noMealText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  commentsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
});
