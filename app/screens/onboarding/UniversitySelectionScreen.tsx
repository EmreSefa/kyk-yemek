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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

type UniversitySelectionRouteProp = RouteProp<
  OnboardingStackParamList,
  "UniversitySelection"
>;
type UniversitySelectionNavigationProp = StackNavigationProp<
  OnboardingStackParamList,
  "UniversitySelection"
>;

interface University {
  id: number;
  name: string;
}

export default function UniversitySelectionScreen() {
  const route = useRoute<UniversitySelectionRouteProp>();
  const { cityId } = route.params;
  const navigation = useNavigation<UniversitySelectionNavigationProp>();

  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("");

  useEffect(() => {
    fetchCityName();
    fetchUniversities();
  }, [cityId]);

  async function fetchCityName() {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("city_name")
        .eq("id", cityId)
        .single();

      if (error) throw error;
      if (data) setCityName(data.city_name);
    } catch (error: any) {
      console.error("Error fetching city name:", error.message);
    }
  }

  async function fetchUniversities() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("universities")
        .select("id, name")
        .eq("city_id", cityId)
        .order("name");

      if (error) throw error;

      setUniversities(data || []);
    } catch (error: any) {
      setError("Üniversite bilgileri yüklenirken bir hata oluştu");
      console.error("Error fetching universities:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleUniversitySelect(universityId: number) {
    setSelectedUniversity(universityId);
  }

  function handleGoBack() {
    navigation.goBack();
  }

  function handleContinue() {
    if (selectedUniversity) {
      navigation.navigate("DormitorySelection", {
        cityId,
        universityId: selectedUniversity,
      });
    }
  }

  function renderUniversityItem({ item }: { item: University }) {
    const isSelected = selectedUniversity === item.id;

    return (
      <TouchableOpacity
        style={[styles.universityItem, isSelected && styles.selectedItem]}
        onPress={() => handleUniversitySelect(item.id)}
      >
        <Text
          style={[styles.universityName, isSelected && styles.selectedText]}
        >
          {item.name}
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
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#344955" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stepIndicator}>Adım 2/3</Text>
          <Text style={styles.title}>Hangi üniversitede okuyorsunuz?</Text>
          <Text style={styles.subtitle}>
            {cityName
              ? `${cityName} şehrindeki üniversitenizi seçin`
              : "Üniversitenizi seçin"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={styles.loadingText}>Üniversiteler yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUniversities}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : universities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../../assets/logo.svg")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>
            Bu şehirde kayıtlı üniversite bulunamadı
          </Text>
        </View>
      ) : (
        <FlatList
          data={universities}
          renderItem={renderUniversityItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedUniversity && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedUniversity}
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
  },
  headerContent: {
    marginTop: 10,
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  stepIndicator: {
    fontSize: 14,
    color: "#4A6572",
    marginBottom: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#4A6572",
    textAlign: "center",
  },
  listContainer: {
    padding: 20,
  },
  universityItem: {
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
  universityName: {
    fontSize: 16,
    color: "#344955",
    flex: 1,
    marginRight: 10,
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
