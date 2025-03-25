import React from "react";

// Root stack navigator types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

// Auth stack navigator types
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

// Onboarding stack navigator types
export type OnboardingStackParamList = {
  CitySelection: undefined;
  UniversitySelection: { cityId: number };
  DormitorySelection: { cityId: number; universityId: number };
};

// Main tab navigator types
export type MainTabParamList = {
  Home: undefined;
  WeeklyMenu: undefined;
  Profile: undefined;
  Notifications: undefined;
};

export type MealStackParamList = {
  MealList: undefined;
  MealDetails: { mealId: number };
};

// Notifications stack navigator types
export type NotificationsStackParamList = {
  NotificationsList: undefined;
  NotificationSettings: undefined;
};
