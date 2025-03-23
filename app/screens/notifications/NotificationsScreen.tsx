import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock notification types
type NotificationType = "MEAL_REMINDER" | "MENU_UPDATE" | "APP_UPDATE";

// Notification interface
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Sample notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "MEAL_REMINDER",
    title: "Kahvaltı Zamanı",
    message:
      "Kahvaltı vakti yaklaşıyor. Bugün menüde: Beyaz Peynir, Zeytin, Domates, Salatalık ve Çay var.",
    timestamp: "2023-03-23T07:30:00Z",
    isRead: false,
  },
  {
    id: "2",
    type: "MEAL_REMINDER",
    title: "Akşam Yemeği Zamanı",
    message:
      "Akşam yemeği vakti yaklaşıyor. Bugün menüde: Mercimek Çorbası, Tavuk Sote, Bulgur Pilavı ve Salata var.",
    timestamp: "2023-03-23T17:30:00Z",
    isRead: true,
  },
  {
    id: "3",
    type: "MENU_UPDATE",
    title: "Haftalık Menü Güncellendi",
    message:
      "Önümüzdeki hafta için yemek menüsü güncellendi. Hemen kontrol edin!",
    timestamp: "2023-03-22T12:00:00Z",
    isRead: false,
  },
  {
    id: "4",
    type: "APP_UPDATE",
    title: "Uygulama Güncellendi",
    message:
      "KYK Yemek uygulaması yeni özellikleriyle güncellendi. Artık daha hızlı ve kullanıcı dostu!",
    timestamp: "2023-03-20T09:15:00Z",
    isRead: true,
  },
];

function NotificationsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} dakika önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else {
      return `${diffDays} gün önce`;
    }
  };

  const renderNotificationIcon = (type: NotificationType) => {
    // This would be replaced with actual icons
    switch (type) {
      case "MEAL_REMINDER":
        return "🍽️";
      case "MENU_UPDATE":
        return "📝";
      case "APP_UPDATE":
        return "📱";
      default:
        return "📌";
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        isDarkMode && styles.darkNotificationItem,
        !item.isRead && styles.unreadNotification,
        !item.isRead && isDarkMode && styles.darkUnreadNotification,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{renderNotificationIcon(item.type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text
            style={[styles.notificationTitle, isDarkMode && styles.darkText]}
          >
            {item.title}
          </Text>
          <Text style={[styles.timestamp, isDarkMode && styles.darkTimestamp]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        <Text
          style={[styles.notificationMessage, isDarkMode && styles.darkText]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
        Bildiriminiz bulunmamaktadır.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Bildirimler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Bildirimler
        </Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => {
              setNotifications((prevNotifications) =>
                prevNotifications.map((notification) => ({
                  ...notification,
                  isRead: true,
                }))
              );
            }}
          >
            <Text style={styles.markAllText}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333333",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  darkText: {
    color: "#FFFFFF",
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllText: {
    color: "#4A6572",
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkNotificationItem: {
    backgroundColor: "#1E1E1E",
  },
  unreadNotification: {
    backgroundColor: "#F1F7FB",
  },
  darkUnreadNotification: {
    backgroundColor: "#26323A",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: "#888888",
    marginLeft: 8,
  },
  darkTimestamp: {
    color: "#AAAAAA",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4A6572",
    position: "absolute",
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
  },
});

export default NotificationsScreen;
