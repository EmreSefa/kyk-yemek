import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  useUserPreferences,
  City,
  Dormitory,
} from "../hooks/useUserPreferences";
import { useTheme } from "../hooks/useTheme";
import DropDownPicker from "react-native-dropdown-picker";

interface LocationSelectorProps {
  onCitySelected?: (cityId: number, cityName: string) => void;
  onDormSelected?: (dormId: number, dormName: string) => void;
}

function LocationSelector({
  onCitySelected,
  onDormSelected,
}: LocationSelectorProps) {
  const { isDark } = useTheme();
  const screenHeight = Dimensions.get("window").height;

  const {
    cities,
    dorms,
    selectedCityId,
    selectedDormId,
    loading: isLoading,
    setSelectedCity: updateUserCity,
    setSelectedDorm: updateUserDorm,
    dormsByCity,
  } = useUserPreferences();

  // Dropdown state
  const [cityOpen, setCityOpen] = useState(false);
  const [dormOpen, setDormOpen] = useState(false);
  const [cityValue, setCityValue] = useState<number | null>(null);
  const [dormValue, setDormValue] = useState<number | null>(null);

  // Prepare dropdown items
  const [cityItems, setCityItems] = useState<any[]>([]);
  const [dormItems, setDormItems] = useState<any[]>([]);

  // Format cities for dropdown
  useEffect(() => {
    if (cities.length > 0) {
      const formattedCities = cities.map((city) => ({
        label: city.name,
        value: city.id,
      }));
      setCityItems(formattedCities);
    }
  }, [cities]);

  // Set initial values
  useEffect(() => {
    if (selectedCityId) {
      setCityValue(selectedCityId);
    }
    if (selectedDormId) {
      setDormValue(selectedDormId);
    }
  }, [selectedCityId, selectedDormId]);

  // Update dorm items when city changes
  useEffect(() => {
    if (cityValue) {
      const dormsForCity = dormsByCity(cityValue);
      const formattedDorms = dormsForCity.map((dorm) => ({
        label: dorm.name,
        value: dorm.id,
      }));
      setDormItems(formattedDorms);

      // Reset dorm selection if city changes
      if (selectedDormId && dormValue) {
        const dormExists = dormsForCity.some((dorm) => dorm.id === dormValue);
        if (!dormExists) {
          setDormValue(null);
          updateUserDorm(null);
        }
      }
    } else {
      setDormItems([]);
      setDormValue(null);
    }
  }, [cityValue, dormsByCity]);

  // Handle city selection
  const handleCityChange = async (value: number | null) => {
    if (value !== selectedCityId) {
      await updateUserCity(value);
      if (onCitySelected && value) {
        const city = cities.find((c) => c.id === value);
        if (city) {
          onCitySelected(city.id, city.name);
        }
      }
    }
  };

  // Handle dorm selection
  const handleDormChange = async (value: number | null) => {
    if (value !== selectedDormId) {
      await updateUserDorm(value);
      if (onDormSelected && value) {
        const dorm = dorms.find((d) => d.id === value);
        if (dorm) {
          onDormSelected(dorm.id, dorm.name);
        }
      }
    }
  };

  // When one dropdown is open, close the other
  useEffect(() => {
    if (cityOpen) {
      setDormOpen(false);
    }
  }, [cityOpen]);

  useEffect(() => {
    if (dormOpen) {
      setCityOpen(false);
    }
  }, [dormOpen]);

  // Get current location names
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

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>
        Yemek Konumu
      </Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={isDark ? "#738F9E" : "#4A6572"}
          style={styles.loader}
        />
      ) : (
        <View style={styles.dropdownsContainer}>
          {/* Current Location Display */}
          <View
            style={[
              styles.locationDisplay,
              isDark && styles.darkLocationDisplay,
            ]}
          >
            <Text style={[styles.locationLabel, isDark && styles.darkText]}>
              Güncel Konum
            </Text>
            <Text
              style={[styles.locationValue, isDark && styles.darkHighlightText]}
            >
              {getCityName()}, {getDormName()}
            </Text>
          </View>

          {/* City Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Text style={[styles.dropdownLabel, isDark && styles.darkText]}>
              Şehir
            </Text>
            <DropDownPicker
              open={cityOpen}
              value={cityValue}
              items={cityItems}
              setOpen={setCityOpen}
              setValue={setCityValue}
              onChangeValue={handleCityChange}
              placeholder="Şehir Seçiniz"
              searchable={true}
              searchPlaceholder="Şehir Ara..."
              listMode="MODAL"
              modalTitle="Şehir Seçiniz"
              modalProps={{
                animationType: "slide",
              }}
              maxHeight={screenHeight * 0.5}
              style={[styles.dropdown, isDark && styles.darkDropdown]}
              textStyle={[styles.dropdownText, isDark && styles.darkText]}
              placeholderStyle={[
                styles.placeholderText,
                isDark && styles.darkPlaceholderText,
              ]}
              searchContainerStyle={isDark ? styles.darkSearchContainer : {}}
              searchTextInputStyle={isDark ? styles.darkSearchInput : {}}
              listItemContainerStyle={isDark ? styles.darkListItem : {}}
              listItemLabelStyle={isDark ? styles.darkItemText : {}}
              selectedItemContainerStyle={[
                styles.selectedItem,
                isDark && styles.darkSelectedItem,
              ]}
              selectedItemLabelStyle={styles.selectedItemText}
              modalContentContainerStyle={isDark ? styles.darkModalContent : {}}
              ArrowDownIconComponent={({ style }) => (
                <Text style={[style, isDark && { color: "#fff" }]}>▼</Text>
              )}
              ArrowUpIconComponent={({ style }) => (
                <Text style={[style, isDark && { color: "#fff" }]}>▲</Text>
              )}
            />
          </View>

          {/* Dorm Dropdown */}
          <View style={styles.dropdownWrapper}>
            <Text style={[styles.dropdownLabel, isDark && styles.darkText]}>
              Yurt
            </Text>
            <DropDownPicker
              open={dormOpen}
              value={dormValue}
              items={dormItems}
              setOpen={setDormOpen}
              setValue={setDormValue}
              onChangeValue={handleDormChange}
              placeholder="Yurt Seçiniz"
              searchable={true}
              searchPlaceholder="Yurt Ara..."
              listMode="MODAL"
              modalTitle="Yurt Seçiniz"
              modalProps={{
                animationType: "slide",
              }}
              maxHeight={screenHeight * 0.5}
              disabled={!cityValue}
              disabledStyle={[
                styles.disabledDropdown,
                isDark && styles.darkDisabledDropdown,
              ]}
              style={[styles.dropdown, isDark && styles.darkDropdown]}
              textStyle={[styles.dropdownText, isDark && styles.darkText]}
              placeholderStyle={[
                styles.placeholderText,
                isDark && styles.darkPlaceholderText,
              ]}
              searchContainerStyle={isDark ? styles.darkSearchContainer : {}}
              searchTextInputStyle={isDark ? styles.darkSearchInput : {}}
              listItemContainerStyle={isDark ? styles.darkListItem : {}}
              listItemLabelStyle={isDark ? styles.darkItemText : {}}
              selectedItemContainerStyle={[
                styles.selectedItem,
                isDark && styles.darkSelectedItem,
              ]}
              selectedItemLabelStyle={styles.selectedItemText}
              modalContentContainerStyle={isDark ? styles.darkModalContent : {}}
              ArrowDownIconComponent={({ style }) => (
                <Text style={[style, isDark && { color: "#fff" }]}>▼</Text>
              )}
              ArrowUpIconComponent={({ style }) => (
                <Text style={[style, isDark && { color: "#fff" }]}>▲</Text>
              )}
            />
          </View>
        </View>
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
  darkContainer: {
    backgroundColor: "#262626",
    borderColor: "#444",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  darkText: {
    color: "#F5F5F5",
  },
  loader: {
    marginVertical: 20,
  },
  dropdownsContainer: {
    gap: 16,
  },
  locationDisplay: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#4A6572",
  },
  darkLocationDisplay: {
    backgroundColor: "#333",
    borderLeftColor: "#738F9E",
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A6572",
  },
  darkHighlightText: {
    color: "#8EACBD",
  },
  dropdownWrapper: {
    marginBottom: 5,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  darkDropdown: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  darkPlaceholderText: {
    color: "#aaa",
  },
  disabledDropdown: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },
  darkDisabledDropdown: {
    backgroundColor: "#2a2a2a",
    opacity: 0.7,
  },
  selectedItem: {
    backgroundColor: "#e8f1f5",
  },
  darkSelectedItem: {
    backgroundColor: "#3A4D57",
  },
  selectedItemText: {
    fontWeight: "500",
  },
  darkSearchContainer: {
    backgroundColor: "#333",
    borderColor: "#555",
  },
  darkSearchInput: {
    backgroundColor: "#444",
    color: "#fff",
    borderColor: "#555",
  },
  darkListItem: {
    backgroundColor: "#333",
  },
  darkItemText: {
    color: "#fff",
  },
  darkModalContent: {
    backgroundColor: "#222",
  },
});

export default LocationSelector;
