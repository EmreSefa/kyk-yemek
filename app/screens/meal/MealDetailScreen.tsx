import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  useColorScheme,
  StatusBar,
} from "react-native";
import { useMeals, Meal, MealItem } from "../../hooks/useMeals";
import { Ionicons } from "@expo/vector-icons";
import { CommentsSection } from "../../components/CommentsSection";

interface MealDetailScreenProps {
  mealId: number;
  mealType: string;
  onClose: () => void;
}

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

  const mealItems = getMealItems(meal);

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

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Meal date and calorie info */}
          <View style={styles.infoContainer}>
            <Text
              style={[
                styles.dateText,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              {new Date(meal.meal_date).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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
                {meal.totalCalories || 0} kcal
              </Text>
            </View>
          </View>

          {/* Meal items */}
          <View style={styles.menuContainer}>
            <Text
              style={[
                styles.sectionTitle,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              Menü
            </Text>
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
                style={[
                  styles.noMenuText,
                  isDark ? styles.textDark : styles.textLight,
                ]}
              >
                Detaylı menü bilgisi bulunamadı.
              </Text>
            )}
          </View>

          {/* Ratings */}
          <View style={styles.ratingsContainer}>
            <Text
              style={[
                styles.sectionTitle,
                isDark ? styles.textDark : styles.textLight,
              ]}
            >
              Değerlendirme
            </Text>
            <View style={styles.ratingButtons}>
              <Pressable
                style={[
                  styles.ratingButton,
                  meal.userRating === "like" && styles.ratingButtonActive,
                ]}
                onPress={() => handleRate("like")}
              >
                <Ionicons
                  name={
                    meal.userRating === "like"
                      ? "thumbs-up"
                      : "thumbs-up-outline"
                  }
                  size={20}
                  color={
                    meal.userRating === "like"
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
                    meal.userRating === "like" && styles.ratingTextActive,
                  ]}
                >
                  {meal.likes || 0} Beğeni
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.ratingButton,
                  meal.userRating === "dislike" && styles.ratingButtonActive,
                ]}
                onPress={() => handleRate("dislike")}
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
                      : "#8E8E93"
                  }
                />
                <Text
                  style={[
                    styles.ratingText,
                    isDark ? styles.ratingTextDark : styles.ratingTextLight,
                    meal.userRating === "dislike" && styles.ratingTextActive,
                  ]}
                >
                  {meal.dislikes || 0} Beğenmeme
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsContainer}>
            <CommentsSection mealId={meal.id} />
          </View>
        </View>
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  calorieText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  calorieLight: {
    color: "#FF3B30",
  },
  calorieDark: {
    color: "#FF9500",
  },
  menuContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemCalories: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  noMenuText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
  ratingsContainer: {
    marginBottom: 24,
  },
  ratingButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  ratingButtonActive: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
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
  commentsContainer: {
    marginTop: 8,
  },
  noMealText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  textLight: {
    color: "#000000",
  },
  textDark: {
    color: "#FFFFFF",
  },
});
