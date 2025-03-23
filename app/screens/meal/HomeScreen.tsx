import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
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

// Mock data - To be replaced with Supabase data
const MOCK_MEALS: Meal[] = [
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
];

function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>(MOCK_MEALS);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Simulate data loading
  useEffect(() => {
    setTimeout(() => {
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

  // Render a meal item
  const renderMealItem = ({ item }: { item: Meal }) => (
    <View style={[styles.mealCard, isDarkMode && styles.darkMealCard]}>
      <View style={styles.mealHeader}>
        <Text style={[styles.mealType, isDarkMode && styles.darkText]}>
          {item.meal_type === "BREAKFAST" ? "Kahvaltı" : "Akşam Yemeği"}
        </Text>
        <Text style={[styles.calories, isDarkMode && styles.darkText]}>
          {calculateTotalCalories(item.items)} kcal
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsContainer}>
        {item.items.map((foodItem: MealItem) => (
          <View key={foodItem.id} style={styles.foodItem}>
            <Text style={[styles.foodItemName, isDarkMode && styles.darkText]}>
              {foodItem.item_name}
            </Text>
            <Text
              style={[styles.foodItemCalories, isDarkMode && styles.darkText]}
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
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Yemek listesi yükleniyor...
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
          Bugünün Yemekleri
        </Text>
        <Text style={[styles.date, isDarkMode && styles.darkText]}>
          {new Date().toLocaleDateString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <FlatList
        data={meals}
        renderItem={renderMealItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  date: {
    fontSize: 16,
    color: "#666666",
  },
  listContent: {
    padding: 15,
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

export default HomeScreen;
