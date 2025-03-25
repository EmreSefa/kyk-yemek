import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMeals, DailyMeals } from "../../hooks/useMeals";
import { useTheme } from "../../hooks/useTheme";
import { MealCard } from "../../components/MealCard";
import { useUserPreferences } from "../../hooks/useUserPreferences";

function WeeklyMenuScreen() {
  const { isDark } = useTheme();
  const { selectedCityId, forceRefreshPreferences } = useUserPreferences();

  const { weeklyMeals, isLoading, error, fetchWeeklyMeals, isToday, rateMeal } =
    useMeals();

  // Selected day state
  const [selectedDay, setSelectedDay] = useState<DailyMeals | null>(null);

  // Refresh weekly meals
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    // Force refresh user preferences first
    await forceRefreshPreferences();
    await fetchWeeklyMeals();
    setRefreshing(false);
  };

  // Fetch weekly meals on mount
  useEffect(() => {
    const init = async () => {
      // Force refresh preferences before fetching meals
      const preferences = await forceRefreshPreferences();
      console.log("Initial user preferences in WeeklyMenuScreen:", preferences);
      fetchWeeklyMeals();

      // If we don't have a city ID, set up a delayed retry
      if (!preferences?.cityId) {
        console.log("No city ID detected, setting up delayed retry...");
        const timeoutId = setTimeout(async () => {
          console.log("Executing delayed retry for menu load");
          const retryPrefs = await forceRefreshPreferences();
          console.log("Retry preferences:", retryPrefs);
          if (retryPrefs?.cityId) {
            console.log("City ID found in retry, loading weekly meals");
            fetchWeeklyMeals();
          }
        }, 2000);

        return () => clearTimeout(timeoutId);
      }
    };
    init();
  }, []);

  // Set current day as selected when weekly meals load
  useEffect(() => {
    if (weeklyMeals && weeklyMeals.length > 0) {
      // Find today or default to first day
      const today =
        weeklyMeals.find((day) => isToday(day.date)) || weeklyMeals[0];
      setSelectedDay(today);
    }
  }, [weeklyMeals, isToday]);

  // Handle day selection
  const handleDaySelect = (day: DailyMeals) => {
    setSelectedDay(day);
  };

  // Render day selector button
  const renderDayButton = (day: DailyMeals) => {
    const isSelected =
      selectedDay?.date.toDateString() === day.date.toDateString();
    const isCurrentDay = isToday(day.date);

    return (
      <TouchableOpacity
        key={day.formatted_date}
        style={[
          styles.dayButton,
          isSelected && styles.selectedDayButton,
          isDark && styles.darkDayButton,
          isDark && isSelected && styles.darkSelectedDayButton,
          isCurrentDay && styles.todayButton,
          isDark && isCurrentDay && styles.darkTodayButton,
        ]}
        onPress={() => handleDaySelect(day)}
      >
        <Text
          style={[
            styles.dayName,
            isSelected && styles.selectedDayText,
            isDark && styles.darkText,
            isDark && isSelected && styles.darkSelectedDayText,
          ]}
        >
          {day.day_name.slice(0, 3)}
        </Text>
        <Text
          style={[
            styles.dayDate,
            isSelected && styles.selectedDayText,
            isDark && styles.darkMutedText,
            isDark && isSelected && styles.darkSelectedDayText,
          ]}
        >
          {day.formatted_date.split(" ")[0]}
        </Text>
      </TouchableOpacity>
    );
  };

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
        <Text style={[styles.title, isDark && styles.darkText]}>
          Haftalık Menü
        </Text>

        {/* Days of the week selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}
        >
          {weeklyMeals.map(renderDayButton)}
        </ScrollView>

        {/* Loading state */}
        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={isDark ? "#4A8CFF" : "#4A6572"}
            />
            <Text style={[styles.loadingText, isDark && styles.darkMutedText]}>
              Yemek menüsü yükleniyor...
            </Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchWeeklyMeals}
            >
              <Text style={styles.retryText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selected day meals */}
        {!isLoading && selectedDay && (
          <View style={styles.selectedDayContainer}>
            <Text style={[styles.selectedDayTitle, isDark && styles.darkText]}>
              {selectedDay.formatted_date}{" "}
              {isToday(selectedDay.date) && "(Bugün)"}
            </Text>

            {/* Breakfast */}
            <MealCard
              meal={selectedDay.breakfast}
              mealType="BREAKFAST"
              onRateMeal={rateMeal}
            />

            {/* Dinner */}
            <MealCard
              meal={selectedDay.dinner}
              mealType="DINNER"
              onRateMeal={rateMeal}
            />
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: "row",
    marginBottom: 24,
    paddingBottom: 8,
  },
  dayButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 70,
  },
  darkDayButton: {
    backgroundColor: "#1E1E1E",
  },
  selectedDayButton: {
    backgroundColor: "#4A6572",
  },
  darkSelectedDayButton: {
    backgroundColor: "#2C4251",
  },
  todayButton: {
    borderWidth: 2,
    borderColor: "#FF6B00",
  },
  darkTodayButton: {
    borderColor: "#FF9500",
  },
  dayName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  dayDate: {
    fontSize: 14,
    color: "#666",
  },
  selectedDayText: {
    color: "#FFF",
  },
  selectedDayContainer: {
    marginBottom: 24,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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
  // Dark mode styles
  darkText: {
    color: "#F5F5F5",
  },
  darkMutedText: {
    color: "#999",
  },
  darkSelectedDayText: {
    color: "#FFF",
  },
});

export default WeeklyMenuScreen;
