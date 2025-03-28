import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import LocationSelector from "../../components/LocationSelector";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { supabase } from "../../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

function ProfileScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const {
    selectedCityId,
    selectedUniversityId,
    selectedDormId,
    setSelectedUniversity,
    dorms,
    forceRefreshPreferences,
  } = useUserPreferences();
  const [isLoading, setIsLoading] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Get username from email
  const username = user?.email ? user.email.split("@")[0] : "User";

  const [universityName, setUniversityName] = useState("Yükleniyor...");
  const [cityName, setCityName] = useState("Yükleniyor...");
  const [dormitoryName, setDormitoryName] = useState("Yükleniyor...");

  // Force refresh preferences when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        console.log("ProfileScreen came into focus, refreshing preferences");
        setIsLoading(true);
        try {
          await forceRefreshPreferences();
          setRefreshKey((prev) => prev + 1);
        } catch (error) {
          console.error("Error refreshing preferences:", error);
        } finally {
          setIsLoading(false);
        }
      };
      refreshData();
    }, [])
  );

  // Handle location update
  const handleLocationUpdate = (cityId: number, cityName: string) => {
    setCityName(cityName);
    setRefreshKey((prev) => prev + 1);
  };

  // Handle dormitory update
  const handleDormUpdate = (dormId: number, dormName: string) => {
    setDormitoryName(dormName);
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    // Fetch university and city names
    const fetchLocationNames = async () => {
      if (selectedCityId) {
        try {
          // Fetch city name from Supabase
          const { data: cityData, error: cityError } = await supabase
            .from("cities")
            .select("city_name")
            .eq("id", selectedCityId)
            .single();

          if (cityError) {
            console.error("Error fetching city:", cityError);
            setCityName("Bilinmeyen Şehir");
          } else if (cityData) {
            setCityName(cityData.city_name);
          }

          // Fetch university name if available
          if (selectedUniversityId) {
            const { data: uniData, error: uniError } = await supabase
              .from("universities")
              .select("name")
              .eq("id", selectedUniversityId)
              .single();

            if (uniError) {
              console.error("Error fetching university:", uniError);
              // If university doesn't exist in the database, set a default message
              setUniversityName("Üniversite bulunamadı");

              // Clear the invalid university ID from preferences
              // This will update both AsyncStorage and database
              try {
                await setSelectedUniversity(null);
                console.log(
                  "Cleared invalid university ID:",
                  selectedUniversityId
                );
              } catch (clearError) {
                console.error(
                  "Could not clear invalid university ID:",
                  clearError
                );
              }
            } else if (uniData) {
              setUniversityName(uniData.name);
            }
          } else {
            setUniversityName("Üniversite seçilmedi");
          }

          // Fetch dormitory name if available
          if (selectedDormId) {
            const { data: dormData, error: dormError } = await supabase
              .from("dormitories")
              .select("dorm_name")
              .eq("id", selectedDormId)
              .single();

            if (dormError) {
              console.error("Error fetching dormitory:", dormError);
              setDormitoryName("Yurt bulunamadı");
            } else if (dormData) {
              setDormitoryName(dormData.dorm_name);
            }
          } else {
            setDormitoryName("Yurt seçilmedi");
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
          setCityName("Bilinmeyen Şehir");
          setUniversityName("Bilinmeyen Üniversite");
          setDormitoryName("Bilinmeyen Yurt");
        }
      }
    };

    fetchLocationNames();
  }, [
    selectedCityId,
    selectedUniversityId,
    selectedDormId,
    setSelectedUniversity,
  ]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Display a confirmation alert
      Alert.alert(
        "Çıkış Yap",
        "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel",
            onPress: () => setIsLoading(false),
          },
          {
            text: "Çıkış Yap",
            style: "destructive",
            onPress: async () => {
              try {
                const success = await signOut();

                if (!success) {
                  Alert.alert(
                    "Hata",
                    "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin."
                  );
                }

                // Forcefully clear user-specific state from the profile screen
                setDormitoryName("Yurt seçilmedi");
                setCityName("Şehir seçilmedi");
                setUniversityName("Üniversite seçilmedi");
                forceRefreshPreferences();
              } catch (error) {
                console.error("Error during logout process:", error);
                Alert.alert(
                  "Hata",
                  "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin."
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
      Alert.alert(
        "Hata",
        "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  const copyId = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        Alert.alert("Kopyalandı", "Kullanıcı ID'niz panoya kopyalandı.");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.header, isDark && styles.darkHeader]}>
        <Text style={[styles.headerText, isDark && styles.darkText]}>
          Profil
        </Text>
      </View>

      <ScrollView
        style={[styles.scrollView, isDark && styles.darkScrollView]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.profileCard, isDark && styles.darkCard]}>
          <View style={styles.userInfo}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileImageText}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, isDark && styles.darkText]}>
                {username}
              </Text>
              <Text style={[styles.userEmail, isDark && styles.darkMutedText]}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Location Information Section - Simplified */}
        <View style={[styles.section, isDark && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Kullanıcı Bilgileri
          </Text>

          <View style={styles.infoTable}>
            <View style={[styles.infoRow, isDark && styles.darkInfoRow]}>
              <Text style={[styles.infoLabel, isDark && styles.darkText]}>
                Şehir:
              </Text>
              <Text style={[styles.infoValue, isDark && styles.darkText]}>
                {cityName}
              </Text>
            </View>

            <View style={[styles.infoRow, isDark && styles.darkInfoRow]}>
              <Text style={[styles.infoLabel, isDark && styles.darkText]}>
                Üniversite:
              </Text>
              <Text style={[styles.infoValue, isDark && styles.darkText]}>
                {universityName}
              </Text>
            </View>

            <View style={[styles.infoRow, isDark && styles.darkInfoRow]}>
              <Text style={[styles.infoLabel, isDark && styles.darkText]}>
                Yurt:
              </Text>
              <Text style={[styles.infoValue, isDark && styles.darkText]}>
                {dormitoryName}
              </Text>
            </View>

            <View style={[styles.infoRow, isDark && styles.darkInfoRow]}>
              <Text style={[styles.infoLabel, isDark && styles.darkText]}>
                Konum Değiştir:
              </Text>
              <TouchableOpacity
                style={[
                  styles.changeLocationButton,
                  isDark && styles.darkChangeLocationButton,
                ]}
                onPress={() => setLocationModalVisible(true)}
              >
                <Text
                  style={[styles.changeLocationText, isDark && styles.darkText]}
                >
                  <Ionicons name="location-outline" size={16} /> Konum Değiştir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, isDark && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Ayarlar
          </Text>

          <View style={styles.settingItem}>
            <Text style={[styles.settingText, isDark && styles.darkText]}>
              Bildirimler
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#4A6572" }}
              thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>

          <View
            style={[styles.settingItem, isDark && styles.darkSettingBorder]}
          >
            <Text style={[styles.settingText, isDark && styles.darkText]}>
              Karanlık Mod
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#4A6572" }}
              thumbColor={isDark ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isLoading && styles.disabledButton]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Reset App Data Button */}
        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.disabledButton]}
          onPress={() => {
            Alert.alert(
              "Uygulama Verilerini Temizle",
              "Tüm uygulama verileri ve tercihleriniz silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?",
              [
                {
                  text: "İptal",
                  style: "cancel",
                },
                {
                  text: "Temizle",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setIsLoading(true);

                      // Clear all AsyncStorage data
                      const asyncStorageKeys = [
                        "kyk_yemek_selected_city",
                        "kyk_yemek_selected_university",
                        "kyk_yemek_selected_dorm",
                        "kyk_yemek_onboarding_completed",
                      ];

                      await Promise.all(
                        asyncStorageKeys.map((key) =>
                          AsyncStorage.removeItem(key)
                        )
                      );

                      console.log("AsyncStorage data cleared");

                      // Sign out from Supabase (this will clear auth state)
                      await signOut();

                      Alert.alert(
                        "Başarılı",
                        "Tüm uygulama verileri temizlendi. Uygulamaya yeniden giriş yapabilirsiniz.",
                        [{ text: "Tamam" }]
                      );
                    } catch (error) {
                      console.error("Error resetting app:", error);
                      Alert.alert(
                        "Hata",
                        "Veriler temizlenirken bir hata oluştu. Lütfen tekrar deneyin.",
                        [{ text: "Tamam" }]
                      );
                    } finally {
                      setIsLoading(false);
                    }
                  },
                },
              ]
            );
          }}
          disabled={isLoading}
        >
          <Ionicons name="refresh-outline" size={22} color="#fff" />
          <Text style={styles.resetText}>Uygulama Verilerini Temizle</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModalVisible}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View
          style={[styles.modalContainer, isDark && styles.darkModalContainer]}
        >
          <View
            style={[styles.modalContent, isDark && styles.darkModalContent]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                Konum Değiştir
              </Text>
              <TouchableOpacity
                onPress={() => setLocationModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>

            <LocationSelector
              onCitySelected={handleLocationUpdate}
              onDormSelected={handleDormUpdate}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setLocationModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  darkContainer: {
    backgroundColor: "#1E1E1E",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  darkHeader: {
    borderBottomColor: "#333",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#344955",
  },
  darkText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  darkScrollView: {
    backgroundColor: "#1E1E1E",
  },
  contentContainer: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: "#222",
    shadowColor: "#000",
    shadowOpacity: 0.2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4A6572",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  userDetails: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#344955",
  },
  userEmail: {
    fontSize: 14,
    color: "#546E7A",
    marginTop: 4,
  },
  darkMutedText: {
    color: "#aaa",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#344955",
    marginBottom: 15,
  },
  infoTable: {
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkInfoRow: {
    borderBottomColor: "#333",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#344955",
    width: "30%",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "400",
    color: "#546E7A",
    width: "70%",
    textAlign: "right",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  darkSettingBorder: {
    borderBottomColor: "#333",
  },
  settingText: {
    fontSize: 16,
    color: "#344955",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  changeLocationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  darkChangeLocationButton: {
    backgroundColor: "#333",
  },
  changeLocationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#344955",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  darkModalContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: "#222",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#344955",
  },
  closeButton: {
    padding: 5,
  },
  saveButton: {
    backgroundColor: "#4A6572",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9800",
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  resetText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileScreen;
