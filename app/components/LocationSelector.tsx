import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useUserPreferences,
  City,
  Dormitory,
} from "../hooks/useUserPreferences";
import { useColorScheme } from "react-native";

interface LocationSelectorProps {
  onCitySelected?: (cityId: number, cityName: string) => void;
  onDormSelected?: (dormId: number, dormName: string) => void;
}

function LocationSelector({
  onCitySelected,
  onDormSelected,
}: LocationSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    cities,
    dorms,
    selectedCityId,
    selectedDormId,
    loading,
    setSelectedCity,
    setSelectedDorm,
    dormsByCity,
  } = useUserPreferences();

  const [showCityModal, setShowCityModal] = useState(false);
  const [showDormModal, setShowDormModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Selected location names
  const [selectedCityName, setSelectedCityName] = useState<string>("Seçilmedi");
  const [selectedDormName, setSelectedDormName] = useState<string>("Seçilmedi");

  // Update selected names when values change
  useEffect(() => {
    if (selectedCityId) {
      const city = cities.find((c) => c.id === selectedCityId);
      if (city) {
        setSelectedCityName(city.name);
      }
    } else {
      setSelectedCityName("Seçilmedi");
    }

    if (selectedDormId) {
      const dorm = dorms.find((d) => d.id === selectedDormId);
      if (dorm) {
        setSelectedDormName(dorm.name);
      }
    } else {
      setSelectedDormName("Seçilmedi");
    }
  }, [selectedCityId, selectedDormId, cities, dorms]);

  // Handle city selection
  const handleCitySelect = async (city: City) => {
    setShowCityModal(false);
    setSearchText("");

    // Only update if city changed
    if (city.id !== selectedCityId) {
      await setSelectedCity(city.id);
      setSelectedCityName(city.name);
      setSelectedDormName("Seçilmedi");

      if (onCitySelected) {
        onCitySelected(city.id, city.name);
      }
    }
  };

  // Handle dormitory selection
  const handleDormSelect = async (dorm: Dormitory) => {
    setShowDormModal(false);
    setSearchText("");

    // Only update if dorm changed
    if (dorm.id !== selectedDormId) {
      await setSelectedDorm(dorm.id);
      setSelectedDormName(dorm.name);

      if (onDormSelected) {
        onDormSelected(dorm.id, dorm.name);
      }
    }
  };

  // Filter cities based on search text
  const filteredCities = searchText
    ? cities.filter((city) =>
        city.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : cities;

  // Get dorms for selected city
  const dormsForCity = selectedCityId ? dormsByCity(selectedCityId) : [];

  // Filter dorms based on search
  const filteredDormsForCity = searchText
    ? dormsForCity.filter((dorm) =>
        dorm.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : dormsForCity;

  // Render a city item
  const renderCityItem = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedCityId === item.id && styles.selectedItem,
        isDark && selectedCityId === item.id && styles.darkSelectedItem,
      ]}
      onPress={() => handleCitySelect(item)}
    >
      <Text
        style={[
          styles.itemText,
          selectedCityId === item.id && styles.selectedItemText,
          isDark && selectedCityId === item.id && styles.darkSelectedItemText,
        ]}
      >
        {item.name}
      </Text>
      {selectedCityId === item.id && (
        <Ionicons
          name="checkmark"
          size={20}
          color={isDark ? "#fff" : "#4A6572"}
        />
      )}
    </TouchableOpacity>
  );

  // Render a dormitory item
  const renderDormItem = ({ item }: { item: Dormitory }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedDormId === item.id && styles.selectedItem,
        isDark && selectedDormId === item.id && styles.darkSelectedItem,
      ]}
      onPress={() => handleDormSelect(item)}
    >
      <Text
        style={[
          styles.itemText,
          selectedDormId === item.id && styles.selectedItemText,
          isDark && selectedDormId === item.id && styles.darkSelectedItemText,
        ]}
      >
        {item.name}
      </Text>
      {selectedDormId === item.id && (
        <Ionicons
          name="checkmark"
          size={20}
          color={isDark ? "#fff" : "#4A6572"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isDark && styles.darkText]}>
        Konum Seçiniz
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4A6572" style={styles.loader} />
      ) : (
        <>
          {/* City Selector */}
          <TouchableOpacity
            style={[styles.selectorButton, isDark && styles.darkSelectorButton]}
            onPress={() => setShowCityModal(true)}
          >
            <Text style={[styles.selectorText, isDark && styles.darkText]}>
              {selectedCityName}
            </Text>
            <Ionicons
              name="chevron-down"
              size={22}
              color={isDark ? "#fff" : "#333"}
            />
          </TouchableOpacity>

          {/* Dorm Selector - Only enabled if city is selected */}
          <TouchableOpacity
            style={[
              styles.selectorButton,
              isDark && styles.darkSelectorButton,
              !selectedCityId && styles.disabledButton,
            ]}
            onPress={() => selectedCityId && setShowDormModal(true)}
            disabled={!selectedCityId}
          >
            <Text
              style={[
                styles.selectorText,
                isDark && styles.darkText,
                !selectedCityId && styles.disabledText,
              ]}
            >
              {selectedCityId ? selectedDormName : "Yurt Seçiniz"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={22}
              color={!selectedCityId || isDark ? "#aaa" : "#333"}
            />
          </TouchableOpacity>

          {/* City Selection Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showCityModal}
            onRequestClose={() => setShowCityModal(false)}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, isDark && styles.darkModalView]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                    Şehir Seçiniz
                  </Text>
                  <TouchableOpacity onPress={() => setShowCityModal(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#fff" : "#333"}
                    />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.searchInput, isDark && styles.darkSearchInput]}
                  placeholder="Şehir Ara..."
                  placeholderTextColor={isDark ? "#aaa" : "#999"}
                  value={searchText}
                  onChangeText={setSearchText}
                />

                <FlatList
                  data={filteredCities}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderCityItem}
                  style={styles.list}
                />
              </View>
            </View>
          </Modal>

          {/* Dorm Selection Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showDormModal}
            onRequestClose={() => setShowDormModal(false)}
          >
            <View style={styles.centeredView}>
              <View style={[styles.modalView, isDark && styles.darkModalView]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                    Yurt Seçiniz
                  </Text>
                  <TouchableOpacity onPress={() => setShowDormModal(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#fff" : "#333"}
                    />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.searchInput, isDark && styles.darkSearchInput]}
                  placeholder="Yurt Ara..."
                  placeholderTextColor={isDark ? "#aaa" : "#999"}
                  value={searchText}
                  onChangeText={setSearchText}
                />

                {filteredDormsForCity.length > 0 ? (
                  <FlatList
                    data={filteredDormsForCity}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderDormItem}
                    style={styles.list}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, isDark && styles.darkText]}>
                      Bu şehirde kayıtlı yurt bulunamadı
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectorText: {
    fontSize: 16,
    color: "#333",
  },
  disabledButton: {
    backgroundColor: "#F0F0F0",
    borderColor: "#E0E0E0",
  },
  disabledText: {
    color: "#999",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  list: {
    maxHeight: 400,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedItem: {
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 3,
    borderLeftColor: "#4A6572",
  },
  selectedItemText: {
    color: "#333",
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  loader: {
    marginVertical: 20,
  },
  // Dark mode styles
  darkText: {
    color: "#fff",
  },
  darkSelectorButton: {
    backgroundColor: "#2C2C2C",
    borderColor: "#444",
  },
  darkModalView: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
  },
  darkSearchInput: {
    backgroundColor: "#2C2C2C",
    borderColor: "#444",
    color: "#fff",
  },
  darkSelectedItem: {
    backgroundColor: "#3A3F44",
    borderLeftColor: "#738F9E",
  },
  darkSelectedItemText: {
    color: "#738F9E",
    fontWeight: "500",
  },
});

export default LocationSelector;
