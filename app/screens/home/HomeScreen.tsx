import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "../../hooks/useAuth";
import { useMeals, MealItem } from "../../hooks/useMeals";
import { useUserPreferences } from "../../hooks/useUserPreferences";

function HomeScreen() {
  const { user } = useAuth();
  const { selectedCityId } = useUserPreferences();
  const { todayMeals, isLoading, error, fetchTodayMeals } = useMeals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodayMeals();
    setRefreshing(false);
  };

  const today = new Date();
  const formattedDate = format(today, "d MMMM yyyy, EEEE", { locale: tr });

  const renderMealItem = (item: MealItem) => (
    <View key={item.id} style={styles.mealItem}>
      <Text style={styles.mealItemName}>{item.item_name}</Text>
      {item.calories && (
        <Text style={styles.mealItemCalories}>{item.calories} kcal</Text>
      )}
      {item.description && (
        <Text style={styles.mealItemDescription}>{item.description}</Text>
      )}
    </View>
  );

  const renderMealSection = (
    title: string,
    mealItems: MealItem[] | null,
    emptyMessage: string
  ) => (
    <View style={styles.mealSection}>
      <Text style={styles.mealTitle}>{title}</Text>
      {mealItems && mealItems.length > 0 ? (
        <View style={styles.mealItemsContainer}>
          {mealItems.map((item) => renderMealItem(item))}
        </View>
      ) : (
        <View style={styles.emptyMealContainer}>
          <Image
            source={require("../../../assets/icons/empty-plate.png")}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Merhaba, {user?.email?.split("@")[0] || "Misafir"}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {!selectedCityId ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Lütfen önce şehir ve yurt seçin
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => console.log("Navigate to Profile")}
            >
              <Text style={styles.retryButtonText}>Profil Sayfasına Git</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A6572" />
            <Text style={styles.loadingText}>Yemek menüsü yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchTodayMeals}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderMealSection(
              "Kahvaltı",
              todayMeals.breakfast?.meal_items || null,
              "Bugün için kahvaltı menüsü bulunamadı."
            )}

            {renderMealSection(
              "Akşam Yemeği",
              todayMeals.dinner?.meal_items || null,
              "Bugün için akşam yemeği menüsü bulunamadı."
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: "#666666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4A6572",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  mealSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  mealItemsContainer: {
    gap: 12,
  },
  mealItem: {
    padding: 12,
    backgroundColor: "#F7F9FB",
    borderRadius: 8,
  },
  mealItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  mealItemCalories: {
    fontSize: 14,
    color: "#4A6572",
    fontWeight: "500",
    marginBottom: 4,
  },
  mealItemDescription: {
    fontSize: 14,
    color: "#666666",
  },
  emptyMealContainer: {
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
  },
});

export default HomeScreen;
