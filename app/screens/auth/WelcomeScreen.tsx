import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "../../hooks/useTheme";
import { AuthStackParamList } from "../../navigation/types";
import { CommonActions } from "@react-navigation/native";

type WelcomeScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Welcome"
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { isDark } = useTheme();

  const handleLoginPress = () => {
    console.log("Login button pressed, navigating to Login screen");
    // Using commonActions for more reliable navigation
    navigation.dispatch(
      CommonActions.navigate({
        name: "Login",
      })
    );
  };

  const handleRegisterPress = () => {
    console.log("Register button pressed, navigating to Register screen");
    navigation.dispatch(
      CommonActions.navigate({
        name: "Register",
      })
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.darkText]}>KYK Yemek</Text>
        <Text style={[styles.subtitle, isDark && styles.darkText]}>
          Yurt yemeklerini kolayca takip edin ve hiçbir öğünü kaçırmayın!
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLoginPress}
          >
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRegisterPress}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Kaydol
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
  },
  darkText: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666666",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: "#4A6572",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#4A6572",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#4A6572",
  },
  configButton: {
    backgroundColor: "#344955",
    marginTop: 16,
  },
});

export default WelcomeScreen;
