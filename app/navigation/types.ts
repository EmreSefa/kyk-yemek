export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  SetupPreferences: undefined;
};

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

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
