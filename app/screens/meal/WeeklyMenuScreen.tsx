import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define types for our data model
interface MealItem {
  id: number;
  item_name: string;
  calories: number | null;
}

interface Meal {
  id: number;
  meal_type: "BREAKFAST" | "DINNER";
  meal_date: string;
  items: MealItem[];
}

interface DayMeals {
  date: string;
  formattedDate: string;
  weekday: string;
  meals: Meal[];
}

// Mock data - To be replaced with Supabase data
const MOCK_WEEKLY_MEALS: DayMeals[] = [
  {
    date: "2023-03-23",
    formattedDate: "23 Mart 2023",
    weekday: "Perşembe",
    meals: [
      {
        id: 1,
        meal_type: "BREAKFAST",
        meal_date: "2023-03-23",
        items: [
          { id: 1, item_name: "Beyaz Peynir", calories: 80 },
          { id: 2, item_name: "Siyah Zeytin", calories: 30 },
          { id: 3, item_name: "Domates", calories: 20 },
          { id: 4, item_name: "Salatalık", calories: 15 },
          { id: 5, item_name: "Ekmek", calories: 120 },
          { id: 6, item_name: "Çay", calories: 0 },
        ],
      },
      {
        id: 2,
        meal_type: "DINNER",
        meal_date: "2023-03-23",
        items: [
          { id: 7, item_name: "Mercimek Çorbası", calories: 150 },
          { id: 8, item_name: "Tavuk Sote", calories: 250 },
          { id: 9, item_name: "Bulgur Pilavı", calories: 180 },
          { id: 10, item_name: "Yoğurt", calories: 100 },
          { id: 11, item_name: "Salata", calories: 50 },
          { id: 12, item_name: "Ekmek", calories: 120 },
        ],
      },
    ],
  },
  {
    date: "2023-03-24",
    formattedDate: "24 Mart 2023",
    weekday: "Cuma",
    meals: [
      {
        id: 3,
        meal_type: "BREAKFAST",
        meal_date: "2023-03-24",
        items: [
          { id: 13, item_name: "Kızarmış Ekmek", calories: 150 },
          { id: 14, item_name: "Kaşar Peyniri", calories: 100 },
          { id: 15, item_name: "Haşlanmış Yumurta", calories: 70 },
          { id: 16, item_name: "Domates", calories: 20 },
          { id: 17, item_name: "Salatalık", calories: 15 },
          { id: 18, item_name: "Çay", calories: 0 },
        ],
      },
      {
        id: 4,
        meal_type: "DINNER",
        meal_date: "2023-03-24",
        items: [
          { id: 19, item_name: "Ezogelin Çorbası", calories: 120 },
          { id: 20, item_name: "İzmir Köfte", calories: 320 },
          { id: 21, item_name: "Pirinç Pilavı", calories: 200 },
          { id: 22, item_name: "Cacık", calories: 80 },
          { id: 23, item_name: "Baklava (2 dilim)", calories: 350 },
          { id: 24, item_name: "Ekmek", calories: 120 },
        ],
      },
    ],
  },
  // Add more days as needed...
];

function WeeklyMenuScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyMeals, setWeeklyMeals] = useState<DayMeals[]>(MOCK_WEEKLY_MEALS);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  useEffect(() => {
    // Simulate data loading and set the current day as selected
    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      setSelectedDay(weeklyMeals[0].date); // Default to first day in the list
      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate total calories for a meal
  const calculateTotalCalories = (items: MealItem[]): number => {
    return items.reduce(
      (total: number, item: MealItem) => total + (item.calories || 0),
      0
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Haftalık yemek listesi yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Haftalık Yemek Menüsü
        </Text>
      </View>

      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weeklyMeals.map((dayData) => (
            <TouchableOpacity
              key={dayData.date}
              style={[
                styles.dayButton,
                selectedDay === dayData.date && styles.selectedDayButton,
                isDarkMode && styles.darkDayButton,
                selectedDay === dayData.date &&
                  isDarkMode &&
                  styles.darkSelectedDayButton,
              ]}
              onPress={() => setSelectedDay(dayData.date)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDay === dayData.date && styles.selectedDayText,
                  isDarkMode && styles.darkDayText,
                  selectedDay === dayData.date &&
                    isDarkMode &&
                    styles.darkSelectedDayText,
                ]}
              >
                {dayData.weekday}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDay === dayData.date && styles.selectedDateText,
                  isDarkMode && styles.darkDateText,
                  selectedDay === dayData.date &&
                    isDarkMode &&
                    styles.darkSelectedDateText,
                ]}
              >
                {dayData.formattedDate.split(" ")[0]} {/* Only show the day */}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.mealsContainer}>
        {weeklyMeals
          .find((day) => day.date === selectedDay)
          ?.meals.map((meal) => (
            <View
              key={meal.id}
              style={[styles.mealCard, isDarkMode && styles.darkMealCard]}
            >
              <View style={styles.mealHeader}>
                <Text style={[styles.mealType, isDarkMode && styles.darkText]}>
                  {meal.meal_type === "BREAKFAST" ? "Kahvaltı" : "Akşam Yemeği"}
                </Text>
                <Text style={[styles.calories, isDarkMode && styles.darkText]}>
                  {calculateTotalCalories(meal.items)} kcal
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.itemsContainer}>
                {meal.items.map((foodItem) => (
                  <View key={foodItem.id} style={styles.foodItem}>
                    <Text
                      style={[
                        styles.foodItemName,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      {foodItem.item_name}
                    </Text>
                    <Text
                      style={[
                        styles.foodItemCalories,
                        isDarkMode && styles.darkText,
                      ]}
                    >
                      {foodItem.calories || 0} kcal
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Detaylar</Text>
              </TouchableOpacity>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333333",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  darkText: {
    color: "#FFFFFF",
  },
  daySelector: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#E8ECF0",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    minWidth: 100,
  },
  selectedDayButton: {
    backgroundColor: "#4A6572",
  },
  darkDayButton: {
    backgroundColor: "#2C2C2C",
  },
  darkSelectedDayButton: {
    backgroundColor: "#4A6572",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  darkDayText: {
    color: "#DDDDDD",
  },
  darkSelectedDayText: {
    color: "#FFFFFF",
  },
  dateText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  selectedDateText: {
    color: "#FFFFFF",
  },
  darkDateText: {
    color: "#AAAAAA",
  },
  darkSelectedDateText: {
    color: "#FFFFFF",
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkMealCard: {
    backgroundColor: "#1E1E1E",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  calories: {
    fontSize: 16,
    color: "#4A6572",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginBottom: 12,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  foodItemName: {
    fontSize: 16,
    color: "#333333",
  },
  foodItemCalories: {
    fontSize: 14,
    color: "#666666",
  },
  detailsButton: {
    backgroundColor: "#4A6572",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default WeeklyMenuScreen;
