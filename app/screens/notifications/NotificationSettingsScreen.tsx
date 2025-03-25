import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useNotifications } from "../../hooks/useNotifications";
import { sendTestNotification } from "../../../lib/services/notificationService";

function NotificationSettingsScreen() {
  const { isDark } = useTheme();
  const {
    notificationsEnabled,
    breakfastEnabled,
    dinnerEnabled,
    isLoading,
    toggleNotifications,
    toggleBreakfastNotifications,
    toggleDinnerNotifications,
  } = useNotifications();

  // Handler functions for toggles
  const handleToggleNotifications = async (value: boolean) => {
    await toggleNotifications(value);
  };

  const handleToggleBreakfast = async (value: boolean) => {
    await toggleBreakfastNotifications(value);
  };

  const handleToggleDinner = async (value: boolean) => {
    await toggleDinnerNotifications(value);
  };

  // Test notification function
  const handleTestNotification = async () => {
    const result = await sendTestNotification();

    if (result) {
      Alert.alert(
        "Test Bildirimi Gönderildi",
        "Rastgele bir yemek bildirimi (kahvaltı veya akşam yemeği) gönderildi. Bildirimlerinizi kontrol edin ve düzgün çalışıp çalışmadığını doğrulayın."
      );
    } else {
      Alert.alert(
        "Bildirim Gönderilemedi",
        "Bildirimlerin cihaz ayarlarınızda etkinleştirilmiş olduğundan emin olun."
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>
            Bildirim Ayarları
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.darkSection]}>
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingTitle, isDark && styles.darkText]}>
                Bildirimleri Etkinleştir
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  isDark && styles.darkDescriptionText,
                ]}
              >
                Tüm uygulama bildirimlerini açın veya kapatın
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#4A6572" }}
              thumbColor={notificationsEnabled ? "#F8F8F8" : "#F4F3F4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={handleToggleNotifications}
              value={notificationsEnabled}
              disabled={isLoading}
            />
          </View>
        </View>

        {notificationsEnabled && (
          <>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              Yemek Bildirimleri
            </Text>

            <View style={[styles.section, isDark && styles.darkSection]}>
              <View style={styles.settingRow}>
                <View>
                  <Text
                    style={[styles.settingTitle, isDark && styles.darkText]}
                  >
                    Kahvaltı Bildirimleri
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      isDark && styles.darkDescriptionText,
                    ]}
                  >
                    Her sabah 07:00'da kahvaltı menüsü bildirimi al
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#767577", true: "#4A6572" }}
                  thumbColor={breakfastEnabled ? "#F8F8F8" : "#F4F3F4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={handleToggleBreakfast}
                  value={breakfastEnabled}
                  disabled={isLoading || !notificationsEnabled}
                />
              </View>

              <View style={styles.settingRow}>
                <View>
                  <Text
                    style={[styles.settingTitle, isDark && styles.darkText]}
                  >
                    Akşam Yemeği Bildirimleri
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      isDark && styles.darkDescriptionText,
                    ]}
                  >
                    Her gün 16:00'da akşam yemeği menüsü bildirimi al
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#767577", true: "#4A6572" }}
                  thumbColor={dinnerEnabled ? "#F8F8F8" : "#F4F3F4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={handleToggleDinner}
                  value={dinnerEnabled}
                  disabled={isLoading || !notificationsEnabled}
                />
              </View>
            </View>

            <View style={[styles.section, isDark && styles.darkSection]}>
              <Text
                style={[
                  styles.sectionNote,
                  isDark && styles.darkDescriptionText,
                ]}
              >
                Not: Bildirimler KYK yemek saatlerine göre ayarlanmıştır.
                Kahvaltı bildirimleri 07:00'da, akşam yemeği bildirimleri
                16:00'da alacaksınız.
              </Text>
            </View>

            {/* Test Notification Button */}
            <TouchableOpacity
              style={[styles.testButton, isDark && styles.darkTestButton]}
              onPress={handleTestNotification}
            >
              <Text
                style={[styles.testButtonText, isDark && { color: "#FFF" }]}
              >
                Bildirim Testi Yap
              </Text>
              <Text
                style={[styles.testButtonSubtext, isDark && { color: "#DDD" }]}
              >
                Rastgele bir yemek bildirimi gönderir
              </Text>
            </TouchableOpacity>
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
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  darkText: {
    color: "#FFFFFF",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  darkSection: {
    backgroundColor: "#1E1E1E",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    maxWidth: "90%",
    marginTop: 4,
  },
  darkDescriptionText: {
    color: "#AAAAAA",
  },
  sectionNote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666666",
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: "#4A6572",
    borderRadius: 10,
    padding: 16,
    margin: 16,
    alignItems: "center",
  },
  darkTestButton: {
    backgroundColor: "#344955",
  },
  testButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  testButtonSubtext: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});

export default NotificationSettingsScreen;
