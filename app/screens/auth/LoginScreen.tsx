import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../hooks/useAuth";

interface LoginScreenProps {
  navigation: StackNavigationProp<any>;
}

function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert("Giriş Başarısız", error.message);
      }
    } catch (err) {
      Alert.alert("Bir hata oluştu", "Lütfen tekrar deneyin.");
      console.error("Login error:", err);
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
              style={[styles.forgotPasswordText, isDarkMode && styles.darkText]}
            >
              Şifremi unuttum
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
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
              <Text style={styles.signupLink}>Kaydol</Text>
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
  disabledButton: {
    backgroundColor: "#7A96A2",
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
});

export default LoginScreen;
