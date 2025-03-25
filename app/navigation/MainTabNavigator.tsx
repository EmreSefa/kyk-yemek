import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

// Screens
import HomeScreen from "../screens/home/HomeScreen";
import WeeklyMenuScreen from "../screens/weekly-menu/WeeklyMenuScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
// import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import NotificationsNavigator from "./NotificationsNavigator";

// Tab Bar Icons
function HomeIcon({ color }: { color: string }) {
  return <Ionicons name="home-outline" size={24} color={color} />;
}

function CalendarIcon({ color }: { color: string }) {
  return <Ionicons name="calendar-outline" size={24} color={color} />;
}

function ProfileIcon({ color }: { color: string }) {
  return <Ionicons name="person-outline" size={24} color={color} />;
}

function NotificationIcon({ color }: { color: string }) {
  return <Ionicons name="notifications-outline" size={24} color={color} />;
}

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4A6572",
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: {
          backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
          borderTopColor: isDark ? "#333333" : "#EEEEEE",
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
        component={NotificationsNavigator}
        options={{
          tabBarLabel: "Bildirimler",
          tabBarIcon: ({ color }) => <NotificationIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
