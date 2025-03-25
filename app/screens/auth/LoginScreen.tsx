import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../hooks/useAuth";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useTheme } from "../../hooks/useTheme";
import { CommonActions } from "@react-navigation/native";

interface LoginScreenProps {
  navigation: StackNavigationProp<any>;
}

function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { signIn, isAuthenticated } = useAuth();
  const { selectedCityId, selectedUniversityId, selectedDormId } =
    useUserPreferences();
  const { isDark } = useTheme();

  // Monitor authentication state changes and redirect if needed
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Auth state detected as authenticated in LoginScreen");
      // Check if user has completed onboarding
      if (selectedCityId && selectedDormId) {
        console.log(
          "LoginScreen: User has completed onboarding, navigating to Main"
        );
        // Use CommonActions to reset the navigation state to avoid stacking
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Main" }],
          })
        );
      } else {
        console.log(
          "LoginScreen: User hasn't completed onboarding, navigating to Onboarding"
        );
        // Navigate to onboarding
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Onboarding" }],
          })
        );
      }
    }
  }, [isAuthenticated, selectedCityId, selectedDormId, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen e-posta ve şifre alanlarını doldurunuz.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Attempting login with email:", email);
      const result = await signIn(email, password);

      console.log("Login result:", JSON.stringify(result, null, 2));

      if (!result.success) {
        console.log("Login failed:", result.message);
        let errorMessage = "E-posta veya şifre hatalı.";

        // Check for specific error messages from Supabase
        if (result.message) {
          if (result.message.includes("Invalid login")) {
            errorMessage = "E-posta veya şifreniz yanlış.";
          } else if (result.message.includes("Email not confirmed")) {
            errorMessage =
              "E-posta adresinizi doğrulamanız gerekiyor. Lütfen gelen kutunuzu kontrol edin.";
          }
        }

        Alert.alert("Giriş Başarısız", errorMessage);
      } else {
        console.log("Login successful, user:", result.user?.email);
        // Navigation will be handled by the useEffect hook when isAuthenticated becomes true
      }
    } catch (error) {
      Alert.alert(
        "Hata",
        "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyiniz."
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Giriş Yap
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="E-posta"
              placeholderTextColor={isDarkMode ? "#999999" : "#666666"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Şifre"
              placeholderTextColor={isDarkMode ? "#999999" : "#666666"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.forgotPasswordText,
                isDarkMode && styles.darkText,
                isLoading && styles.disabledText,
              ]}
            >
              Şifremi unuttum
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, isDarkMode && styles.darkText]}>
              Hesabın yok mu?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              disabled={isLoading}
            >
              <Text
                style={[styles.signupLink, isLoading && styles.disabledText]}
              >
                Kaydol
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333333",
  },
  darkText: {
    color: "#FFFFFF",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: "#333333",
  },
  darkInput: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#666666",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#4A6572",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: "#A0ADB4",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#666666",
    fontSize: 14,
    marginRight: 5,
  },
  signupLink: {
    color: "#4A6572",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default LoginScreen;
