import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MainTabNavigator from "./MainTabNavigator";
import AuthNavigator from "./AuthNavigator";
import { useAuth } from "../hooks/useAuth";

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6572" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FB",
  },
});

export default AppNavigator;
