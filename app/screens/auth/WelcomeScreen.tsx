import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";

interface WelcomeScreenProps {
  navigation: StackNavigationProp<any>;
}

function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          KYK Yemek
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
          Yurt yemeklerini kolayca takip edin ve hiçbir öğünü kaçırmayın!
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate("Register")}
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
});

export default WelcomeScreen;
