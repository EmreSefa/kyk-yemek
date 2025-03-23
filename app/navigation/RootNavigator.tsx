import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../hooks/useAuth";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createStackNavigator();

function RootNavigator() {
  const { session } = useAuth();

  // Global navigation container with conditional rendering based on auth state
  return (
    <NavigationContainer>
      {session ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default RootNavigator;
