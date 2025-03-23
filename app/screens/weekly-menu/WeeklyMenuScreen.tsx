import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMeals, DailyMeals, MealItem } from "../../hooks/useMeals";
import { useUserPreferences } from "../../hooks/useUserPreferences";

const { width } = Dimensions.get("window");

function WeeklyMenuScreen() {
  const { selectedCityId } = useUserPreferences();
  const { weeklyMeals, isLoading, error, fetchWeeklyMeals, isToday } =
    useMeals();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const daysListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (selectedCityId) {
      fetchWeeklyMeals();
    }
  }, [selectedCityId]);

  useEffect(() => {
    // Find today's index to select it by default
    const todayIndex = weeklyMeals.findIndex((day) => isToday(day.date));
    if (todayIndex !== -1) {
      setSelectedDayIndex(todayIndex);
      // Scroll to today in the day selector
      setTimeout(() => {
        daysListRef.current?.scrollToIndex({
          index: todayIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 500);
    }
  }, [weeklyMeals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeeklyMeals();
    setRefreshing(false);
  };

  const renderDayItem = ({
    item,
    index,
  }: {
    item: DailyMeals;
    index: number;
  }) => {
    const isSelected = index === selectedDayIndex;
    const isTodayHighlight = isToday(item.date);

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.selectedDayItem,
          isTodayHighlight && styles.todayDayItem,
        ]}
        onPress={() => setSelectedDayIndex(index)}
      >
        <Text
          style={[
            styles.dayName,
            isSelected && styles.selectedDayText,
            isTodayHighlight && styles.todayDayText,
          ]}
        >
          {item.day_name.substring(0, 3)}
        </Text>
        <Text
          style={[
            styles.dayDate,
            isSelected && styles.selectedDayText,
            isTodayHighlight && styles.todayDayText,
          ]}
        >
          {item.formatted_date.split(" ")[0]}
        </Text>
      </TouchableOpacity>
    );
  };

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
      <Text style={styles.mealSectionTitle}>{title}</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Haftalık Menü</Text>
      </View>

      {!selectedCityId ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lütfen önce şehir ve yurt seçin</Text>
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
            onPress={fetchWeeklyMeals}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.daysContainer}>
            <FlatList
              ref={daysListRef}
              data={weeklyMeals}
              renderItem={renderDayItem}
              keyExtractor={(item, index) => `day-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daysList}
              onScrollToIndexFailed={() => {}}
            />
          </View>

          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {weeklyMeals.length > 0 &&
              selectedDayIndex < weeklyMeals.length && (
                <View>
                  <Text style={styles.selectedDate}>
                    {weeklyMeals[selectedDayIndex].formatted_date}
                  </Text>

                  {renderMealSection(
                    "Kahvaltı",
                    weeklyMeals[selectedDayIndex].breakfast?.meal_items || null,
                    "Bu gün için kahvaltı menüsü bulunamadı."
                  )}

                  {renderMealSection(
                    "Akşam Yemeği",
                    weeklyMeals[selectedDayIndex].dinner?.meal_items || null,
                    "Bu gün için akşam yemeği menüsü bulunamadı."
                  )}
                </View>
              )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  daysContainer: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  daysList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dayItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    minWidth: 60,
  },
  selectedDayItem: {
    backgroundColor: "#4A6572",
  },
  todayDayItem: {
    borderWidth: 1,
    borderColor: "#F44336",
  },
  dayName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textTransform: "capitalize",
  },
  dayDate: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  todayDayText: {
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
  mealSectionTitle: {
    fontSize: 18,
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

export default WeeklyMenuScreen;
