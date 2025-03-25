import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { OnboardingStackParamList } from "./types";

// Import our onboarding screens
import CitySelectionScreen from "../screens/onboarding/CitySelectionScreen";
import UniversitySelectionScreen from "../screens/onboarding/UniversitySelectionScreen";
import DormitorySelectionScreen from "../screens/onboarding/DormitorySelectionScreen";

const Stack = createStackNavigator<OnboardingStackParamList>();

function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CitySelection"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="CitySelection" component={CitySelectionScreen} />
      <Stack.Screen
        name="UniversitySelection"
        component={UniversitySelectionScreen}
      />
      <Stack.Screen
        name="DormitorySelection"
        component={DormitorySelectionScreen}
      />
    </Stack.Navigator>
  );
}

export default OnboardingNavigator;
