import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
  NavigationProp,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  OnboardingStackParamList,
  RootStackParamList,
} from "../../navigation/types";
import { supabase } from "../../../lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DormitorySelectionRouteProp = RouteProp<
  OnboardingStackParamList,
  "DormitorySelection"
>;
type DormitorySelectionNavigationProp = StackNavigationProp<
  OnboardingStackParamList & RootStackParamList,
  "DormitorySelection"
>;

interface Dormitory {
  id: number;
  dorm_name: string;
  gender?: string | null;
}

export default function DormitorySelectionScreen() {
  const route = useRoute<DormitorySelectionRouteProp>();
  const { cityId, universityId } = route.params;
  const navigation = useNavigation<DormitorySelectionNavigationProp>();
  const { user } = useAuth();

  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [selectedDormitory, setSelectedDormitory] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("");
  const [universityName, setUniversityName] = useState<string>("");

  useEffect(() => {
    fetchNames();
    fetchDormitories();
  }, [cityId]);

  async function fetchNames() {
    try {
      // Fetch city name
      const { data: cityData, error: cityError } = await supabase
        .from("cities")
        .select("city_name")
        .eq("id", cityId)
        .single();

      if (cityError) throw cityError;
      if (cityData) setCityName(cityData.city_name);

      // Fetch university name
      const { data: uniData, error: uniError } = await supabase
        .from("universities")
        .select("name")
        .eq("id", universityId)
        .single();

      if (uniError) throw uniError;
      if (uniData) setUniversityName(uniData.name);
    } catch (error: any) {
      console.error("Error fetching names:", error.message);
    }
  }

  async function fetchDormitories() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("dormitories")
        .select("id, dorm_name, gender")
        .eq("city_id", cityId)
        .order("dorm_name");

      if (error) throw error;

      setDormitories(data || []);
    } catch (error: any) {
      setError("Yurt bilgileri yüklenirken bir hata oluştu");
      console.error("Error fetching dormitories:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDormitorySelect(dormitoryId: number) {
    setSelectedDormitory(dormitoryId);
  }

  function handleGoBack() {
    navigation.goBack();
  }

  async function handleComplete() {
    if (!selectedDormitory || !user) return;

    try {
      setSavingPreferences(true);

      // Store the user preferences in Supabase
      const { error } = await supabase
        .from("users")
        .update({
          city_id: cityId,
          university_id: universityId,
          dormitory_id: selectedDormitory,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Also store the preferences to AsyncStorage for quick access
      const CITY_STORAGE_KEY = "kyk_yemek_selected_city";
      const UNIVERSITY_STORAGE_KEY = "kyk_yemek_selected_university";
      const DORM_STORAGE_KEY = "kyk_yemek_selected_dorm";

      await Promise.all([
        AsyncStorage.setItem(CITY_STORAGE_KEY, cityId.toString()),
        AsyncStorage.setItem(UNIVERSITY_STORAGE_KEY, universityId.toString()),
        AsyncStorage.setItem(DORM_STORAGE_KEY, selectedDormitory.toString()),
      ]);

      // Mark onboarding as completed in AsyncStorage
      await AsyncStorage.setItem("kyk_yemek_onboarding_completed", "true");

      console.log(
        "Preferences saved successfully and onboarding marked as completed"
      );

      // Instead of trying to navigate directly, show success alert and let App.tsx handle the navigation
      Alert.alert("Başarılı", "Tercihleriniz kaydedildi.", [
        {
          text: "Tamam",
          onPress: () => {
            // Let the RootNavigator handle the navigation based on AsyncStorage values
            // This is safer than trying to navigate directly
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error saving user preferences:", error.message);
      Alert.alert(
        "Hata",
        "Tercihleriniz kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        [{ text: "Tamam" }]
      );
    } finally {
      setSavingPreferences(false);
    }
  }

  function renderDormitoryItem({ item }: { item: Dormitory }) {
    const isSelected = selectedDormitory === item.id;

    return (
      <TouchableOpacity
        style={[styles.dormitoryItem, isSelected && styles.selectedItem]}
        onPress={() => handleDormitorySelect(item.id)}
      >
        <View style={styles.dormitoryInfo}>
          <Text
            style={[styles.dormitoryName, isSelected && styles.selectedText]}
          >
            {item.dorm_name}
          </Text>
          {item.gender && (
            <View
              style={[
                styles.genderTag,
                item.gender === "MALE"
                  ? styles.maleTag
                  : item.gender === "FEMALE"
                  ? styles.femaleTag
                  : styles.mixedTag,
              ]}
            >
              <Text style={styles.genderText}>
                {item.gender === "MALE"
                  ? "Erkek"
                  : item.gender === "FEMALE"
                  ? "Kız"
                  : "Karma"}
              </Text>
            </View>
          )}
        </View>
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
          <Text style={styles.stepIndicator}>Adım 3/3</Text>
          <Text style={styles.title}>Hangi yurtta kalıyorsunuz?</Text>
          <Text style={styles.subtitle}>
            {cityName
              ? `${cityName} şehrindeki yurdunuzu seçin`
              : "Yurdunuzu seçin"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={styles.loadingText}>Yurtlar yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchDormitories}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : dormitories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require("../../../assets/logo.svg")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>
            Bu şehirde kayıtlı yurt bulunamadı
          </Text>
        </View>
      ) : (
        <FlatList
          data={dormitories}
          renderItem={renderDormitoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!selectedDormitory || savingPreferences) && styles.disabledButton,
          ]}
          onPress={handleComplete}
          disabled={!selectedDormitory || savingPreferences}
        >
          {savingPreferences ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.completeButtonText}>Tamamla</Text>
              <Ionicons name="checkmark" size={20} color="white" />
            </>
          )}
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
  dormitoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
  },
  dormitoryInfo: {
    flex: 1,
    flexDirection: "column",
  },
  selectedItem: {
    backgroundColor: "#EBF2FA",
    borderWidth: 1,
    borderColor: "#4A6572",
  },
  dormitoryName: {
    fontSize: 16,
    color: "#344955",
    marginBottom: 4,
  },
  selectedText: {
    fontWeight: "bold",
  },
  genderTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  maleTag: {
    backgroundColor: "#E6F2FF",
  },
  femaleTag: {
    backgroundColor: "#FFEBF5",
  },
  mixedTag: {
    backgroundColor: "#F0F0F0",
  },
  genderText: {
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#D3D3D3",
  },
  completeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
});
