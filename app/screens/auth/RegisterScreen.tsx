import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../hooks/useAuth";

interface RegisterScreenProps {
  navigation: StackNavigationProp<any>;
}

function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { signUp } = useAuth();

  const handleRegister = async () => {
    // Form validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter uzunluğunda olmalıdır.");
      return;
    }

    try {
      setIsLoading(true);
      const success = await signUp(email, password, { full_name: fullName });

      if (success) {
        Alert.alert(
          "Başarılı",
          "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
          [
            {
              text: "Tamam",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          "Kayıt Başarısız",
          "Hesap oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz."
        );
      }
    } catch (error) {
      Alert.alert(
        "Hata",
        "Kayıt olurken bir hata oluştu. Bu e-posta adresi zaten kullanılıyor olabilir."
      );
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, isDarkMode && styles.darkContainer]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={[styles.title, isDarkMode && styles.darkText]}>
              Kaydol
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Ad Soyad"
                placeholderTextColor={isDarkMode ? "#999999" : "#666666"}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!isLoading}
              />

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

              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Şifre Tekrar"
                placeholderTextColor={isDarkMode ? "#999999" : "#666666"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Kaydol</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, isDarkMode && styles.darkText]}>
                Zaten hesabın var mı?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                disabled={isLoading}
              >
                <Text
                  style={[styles.loginLink, isLoading && styles.disabledText]}
                >
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
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
  registerButton: {
    backgroundColor: "#4A6572",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: "#A0ADB4",
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666666",
    fontSize: 14,
    marginRight: 5,
  },
  loginLink: {
    color: "#4A6572",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default RegisterScreen;
