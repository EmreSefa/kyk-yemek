import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import LocationSelector from "../../components/LocationSelector";

function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Notification and dark mode states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    colorScheme === "dark"
  );

  // Get username from email
  const username = user?.email ? user.email.split("@")[0] : "User";

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu");
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerText, isDark && styles.darkText]}>
          Profil
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
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
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Location Selector */}
        <View style={[styles.section, isDark && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Yurt Konumu
          </Text>
          <LocationSelector />
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

          <View style={styles.settingItem}>
            <Text style={[styles.settingText, isDark && styles.darkText]}>
              Karanlık Mod
            </Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: "#767577", true: "#4A6572" }}
              thumbColor={darkModeEnabled ? "#f5dd4b" : "#f4f3f4"}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: "#FFFFFF",
  },
  userDetails: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  settingText: {
    fontSize: 16,
    color: "#333333",
  },
  logoutButton: {
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  darkCard: {
    backgroundColor: "#2C2C2C",
    borderColor: "#444",
  },
  darkText: {
    color: "#FFFFFF",
  },
});

export default ProfileScreen;
