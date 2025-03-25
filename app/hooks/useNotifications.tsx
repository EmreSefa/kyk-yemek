import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  registerForNotificationsAsync,
  scheduleNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  checkNotificationsInitialized,
  markNotificationsInitialized,
  handleNotificationResponse,
} from "../../lib/services/notificationService";

// Define the context type
type NotificationContextType = {
  notificationsEnabled: boolean;
  breakfastEnabled: boolean;
  dinnerEnabled: boolean;
  pushToken: string | null;
  isLoading: boolean;
  toggleNotifications: (enabled: boolean) => Promise<boolean>;
  toggleBreakfastNotifications: (enabled: boolean) => Promise<boolean>;
  toggleDinnerNotifications: (enabled: boolean) => Promise<boolean>;
  initializeNotifications: () => Promise<void>;
};

// Create the context with default values
const NotificationContext = createContext<NotificationContextType>({
  notificationsEnabled: true,
  breakfastEnabled: true,
  dinnerEnabled: true,
  pushToken: null,
  isLoading: true,
  toggleNotifications: async () => false,
  toggleBreakfastNotifications: async () => false,
  toggleDinnerNotifications: async () => false,
  initializeNotifications: async () => {},
});

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    breakfastEnabled: true,
    dinnerEnabled: true,
  });
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize notification settings
  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const currentSettings = await getNotificationSettings();
      setSettings(currentSettings);

      // Request permissions and get token
      const token = await registerForNotificationsAsync();
      if (token) {
        setPushToken(token);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize notifications on first app run
  const initializeNotifications = async () => {
    const isInitialized = await checkNotificationsInitialized();
    if (!isInitialized) {
      await scheduleNotifications();
      await markNotificationsInitialized();
    }
  };

  // Toggle all notifications
  const toggleNotifications = async (enabled: boolean) => {
    const success = await updateNotificationSettings({
      notificationsEnabled: enabled,
    });

    if (success) {
      setSettings((prev) => ({
        ...prev,
        notificationsEnabled: enabled,
      }));
    }

    return success;
  };

  // Toggle breakfast notifications
  const toggleBreakfastNotifications = async (enabled: boolean) => {
    const success = await updateNotificationSettings({
      breakfastEnabled: enabled,
    });

    if (success) {
      setSettings((prev) => ({
        ...prev,
        breakfastEnabled: enabled,
      }));
    }

    return success;
  };

  // Toggle dinner notifications
  const toggleDinnerNotifications = async (enabled: boolean) => {
    const success = await updateNotificationSettings({
      dinnerEnabled: enabled,
    });

    if (success) {
      setSettings((prev) => ({
        ...prev,
        dinnerEnabled: enabled,
      }));
    }

    return success;
  };

  // Setup notification listeners
  useEffect(() => {
    // Load settings
    loadNotificationSettings();

    // Set up notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    // Cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        ...settings,
        pushToken,
        isLoading,
        toggleNotifications,
        toggleBreakfastNotifications,
        toggleDinnerNotifications,
        initializeNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use the notification context
export function useNotifications() {
  return useContext(NotificationContext);
}
