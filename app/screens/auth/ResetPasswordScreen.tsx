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
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { supabase } from "../../../lib/supabase";
import { AuthStackParamList } from "../../navigation/types";

type ResetPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "ResetPassword"
>;

type ResetPasswordScreenRouteProp = RouteProp<
  AuthStackParamList,
  "ResetPassword"
>;

type Props = {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
};

function ResetPasswordScreen({ navigation, route }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isDark } = useTheme();
  const { token } = route.params || {};

  const handleResetPassword = async () => {
    if (!password || password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor. Lütfen tekrar deneyin.");
      return;
    }

    try {
      setIsLoading(true);

      // Update the user's password using the token
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("Password update error:", error);
        Alert.alert(
          "Hata",
          "Şifreniz güncellenirken bir hata oluştu. Lütfen tekrar deneyin."
        );
      } else {
        // Success
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert(
        "Hata",
        "Şifre güncelleme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
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
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#333333"}
            />
          </TouchableOpacity>
          <Text style={[styles.title, isDark && styles.darkText]}>
            Yeni Şifre Oluştur
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
                Şifre Güncellendi
              </Text>
              <Text style={[styles.successMessage, isDark && styles.darkText]}>
                Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş
                yapabilirsiniz.
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.description, isDark && styles.darkText]}>
                Lütfen yeni şifrenizi belirleyin. Şifreniz en az 6 karakter
                uzunluğunda olmalıdır.
              </Text>

              <TextInput
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="Yeni Şifre"
                placeholderTextColor={isDark ? "#999999" : "#666666"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />

              <TextInput
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="Şifreyi Tekrarla"
                placeholderTextColor={isDark ? "#999999" : "#666666"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
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
                  <Text style={styles.resetButtonText}>Şifreyi Güncelle</Text>
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
  loginButton: {
    backgroundColor: "#4A6572",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ResetPasswordScreen;
