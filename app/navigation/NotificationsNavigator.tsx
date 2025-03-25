import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import NotificationSettingsScreen from "../screens/notifications/NotificationSettingsScreen";
import { useTheme } from "../hooks/useTheme";

// Define navigation param list
export type NotificationsStackParamList = {
  NotificationsList: undefined;
  NotificationSettings: undefined;
};

const Stack = createStackNavigator<NotificationsStackParamList>();

function NotificationsNavigator() {
  const { isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: isDark ? "#121212" : "#F7F9FB",
        },
      }}
    >
      <Stack.Screen name="NotificationsList" component={NotificationsScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
    </Stack.Navigator>
  );
}

export default NotificationsNavigator;
