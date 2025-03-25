import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";

interface ForgotPasswordScreenProps {
  navigation: StackNavigationProp<any>;
}

function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isDark } = useTheme();
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Hata", "Lütfen geçerli bir e-posta adresi giriniz.");
      return;
    }

    try {
      setIsLoading(true);

      // Use the resetPassword function from useAuth hook
      const { success, message } = await resetPassword(email);

      if (!success) {
        console.error("Password reset error:", message);
        Alert.alert(
          "Hata",
          message ||
            "Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
        );
      } else {
        // Success
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert(
        "Hata",
        "Şifre sıfırlama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#333333"}
            />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.darkText]}>
            Şifremi Unuttum
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {isSuccess ? (
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={70}
                color="#4CAF50"
              />
              <Text style={[styles.successTitle, isDark && styles.darkText]}>
                E-posta Gönderildi
              </Text>
              <Text style={[styles.successMessage, isDark && styles.darkText]}>
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen
                gelen kutunuzu kontrol edin ve bağlantıya tıklayarak şifrenizi
                sıfırlayın.
              </Text>
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.backToLoginText}>Giriş Ekranına Dön</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.description, isDark && styles.darkText]}>
                Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin.
                Şifre sıfırlama bağlantısı e-posta adresinize gönderilecektir.
              </Text>

              <TextInput
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="E-posta"
                placeholderTextColor={isDark ? "#999999" : "#666666"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  isLoading && styles.resetButtonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.resetButtonText}>
                    Şifre Sıfırlama Bağlantısı Gönder
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  darkText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 25,
    fontSize: 16,
    color: "#333333",
  },
  darkInput: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
  },
  resetButton: {
    backgroundColor: "#4A6572",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonDisabled: {
    backgroundColor: "#A0ADB4",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 20,
    marginBottom: 15,
  },
  successMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  backToLoginButton: {
    backgroundColor: "#4A6572",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  backToLoginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;
