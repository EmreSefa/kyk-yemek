import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

type CitySelectionScreenNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  "CitySelection"
>;

interface City {
  id: number;
  city_name: string;
}

export default function CitySelectionScreen() {
  const navigation = useNavigation<CitySelectionScreenNavigationProp>();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  async function fetchCities() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cities")
        .select("id, city_name")
        .order("city_name");

      if (error) {
        throw error;
      }

      setCities(data || []);
    } catch (error: any) {
      setError("Şehir bilgileri yüklenirken bir hata oluştu");
      console.error("Error fetching cities:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCitySelect(cityId: number) {
    setSelectedCity(cityId);
  }

  function handleContinue() {
    if (selectedCity) {
      // Store the selected city to user profile later
      navigation.navigate("UniversitySelection", { cityId: selectedCity });
    }
  }

  function renderCityItem({ item }: { item: City }) {
    const isSelected = selectedCity === item.id;

    return (
      <TouchableOpacity
        style={[styles.cityItem, isSelected && styles.selectedItem]}
        onPress={() => handleCitySelect(item.id)}
      >
        <Text style={[styles.cityName, isSelected && styles.selectedText]}>
          {item.city_name}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#4A6572" />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../../assets/logo.svg")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Hangi şehirdesiniz?</Text>
        <Text style={styles.subtitle}>
          Size en iyi hizmeti verebilmemiz için lütfen bulunduğunuz şehri seçin
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={styles.loadingText}>Şehirler yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCities}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cities}
          renderItem={renderCityItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedCity && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedCity}
        >
          <Text style={styles.continueButtonText}>Devam Et</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#344955",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4A6572",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4A6572",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F9AA33",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4A6572",
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
  },
  cityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
  },
  selectedItem: {
    backgroundColor: "#EBF2FA",
    borderWidth: 1,
    borderColor: "#4A6572",
  },
  cityName: {
    fontSize: 16,
    color: "#344955",
  },
  selectedText: {
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  continueButton: {
    backgroundColor: "#F9AA33",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#D3D3D3",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
});
