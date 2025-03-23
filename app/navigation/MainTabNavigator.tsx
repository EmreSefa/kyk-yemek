import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import { useColorScheme, Text, View } from "react-native";

// Import screens
import HomeScreen from "../screens/meal/HomeScreen";
import WeeklyMenuScreen from "../screens/meal/WeeklyMenuScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";

// Simple icons as placeholders (would be replaced with proper icons)
const HomeIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: 20, color }}>🏠</Text>
  </View>
);

const CalendarIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: 20, color }}>📆</Text>
  </View>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: 20, color }}>👤</Text>
  </View>
);

const NotificationIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ fontSize: 20, color }}>🔔</Text>
  </View>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4A6572",
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
          borderTopColor: isDarkMode ? "#333333" : "#EEEEEE",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Bugün",
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="WeeklyMenu"
        component={WeeklyMenuScreen}
        options={{
          tabBarLabel: "Haftalık",
          tabBarIcon: ({ color }) => <CalendarIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Bildirimler",
          tabBarIcon: ({ color }) => <NotificationIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
