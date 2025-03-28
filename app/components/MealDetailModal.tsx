import React, { useState, useEffect } from "react";
import {
  Modal,
  StyleSheet,
  View,
  useColorScheme,
  ActivityIndicator,
  Text,
} from "react-native";
import { MealDetailScreen } from "../screens/meal/MealDetailScreen";

interface MealDetailModalProps {
  visible: boolean;
  mealId: number;
  mealType: string;
  onClose: () => void;
}

export function MealDetailModal({
  visible,
  mealId,
  mealType,
  onClose,
}: MealDetailModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isReady, setIsReady] = useState(false);

  // Reset ready state when modal closes
  useEffect(() => {
    if (!visible) {
      setIsReady(false);
    } else {
      // Small delay to allow animation to start
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="fullScreen"
    >
      <View
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        {isReady ? (
          <MealDetailScreen
            mealId={mealId}
            mealType={mealType}
            onClose={onClose}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={isDark ? "#4A8CFF" : "#4A6572"}
            />
            <Text
              style={[
                styles.loadingText,
                isDark ? styles.loadingTextDark : styles.loadingTextLight,
              ]}
            >
              Yükleniyor...
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  loadingTextLight: {
    color: "#000000",
  },
  loadingTextDark: {
    color: "#FFFFFF",
  },
});
