import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useMeals } from "../../hooks/useMeals";
import { useTheme } from "../../hooks/useTheme";
import { MealCard } from "../../components/MealCard";

function HomeScreen() {
  const { isDark } = useTheme();

  const { selectedCityId, selectedDormId, cities, dorms } =
    useUserPreferences();
  const { todayMeals, isLoading, error, fetchTodayMeals, rateMeal } =
    useMeals();

  // Get city and dorm names
  const getCityName = () => {
    if (!selectedCityId) return "Şehir Seçilmedi";
    const city = cities.find((c) => c.id === selectedCityId);
    return city ? city.name : "Şehir Seçilmedi";
  };

  const getDormName = () => {
    if (!selectedDormId) return "Yurt Seçilmedi";
    const dorm = dorms.find((d) => d.id === selectedDormId);
    return dorm ? dorm.name : "Yurt Seçilmedi";
  };

  // Refresh meals data
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTodayMeals();
    setRefreshing(false);
  }, [fetchTodayMeals]);

  // Fetch meals on mount
  useEffect(() => {
    fetchTodayMeals();
  }, [selectedCityId, selectedDormId]);

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.darkContainer]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Location header */}
        <View style={styles.locationHeader}>
          <View style={styles.locationDetails}>
            <Text style={[styles.welcomeText, isDark && styles.darkText]}>
              Hoş geldin!
            </Text>
            <View style={styles.locationRow}>
              <FontAwesome5
                name="map-marker-alt"
                size={16}
                color={isDark ? "#999" : "#666"}
                style={styles.locationIcon}
              />
              <Text
                style={[styles.locationText, isDark && styles.darkMutedText]}
              >
                {getCityName()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.dateButton, isDark && styles.darkDateButton]}
            onPress={() =>
              Alert.alert("Bilgi", "Bugünün yemekleri gösteriliyor.")
            }
          >
            <Text style={[styles.dateText, isDark && styles.darkHighlightText]}>
              Bugün
            </Text>
            <MaterialIcons
              name="today"
              size={18}
              color={isDark ? "#738F9E" : "#4A6572"}
            />
          </TouchableOpacity>
        </View>

        {/* Error message if present */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchTodayMeals}
            >
              <Text style={styles.retryText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's meals */}
        <View style={styles.mealsContainer}>
          {/* Breakfast */}
          <MealCard
            meal={todayMeals.breakfast}
            mealType="BREAKFAST"
            onRateMeal={rateMeal}
            isLoading={isLoading}
          />

          {/* Dinner */}
          <MealCard
            meal={todayMeals.dinner}
            mealType="DINNER"
            onRateMeal={rateMeal}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  scrollContent: {
    padding: 16,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  locationDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F1F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  darkDateButton: {
    backgroundColor: "#1E2A32",
  },
  dateText: {
    fontSize: 14,
    color: "#4A6572",
    fontWeight: "500",
    marginRight: 4,
  },
  errorContainer: {
    backgroundColor: "#FEEAE9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "500",
  },
  mealsContainer: {
    marginBottom: 20,
  },
  // Dark mode styles
  darkText: {
    color: "#F5F5F5",
  },
  darkMutedText: {
    color: "#999",
  },
  darkHighlightText: {
    color: "#738F9E",
  },
});

export default HomeScreen;
