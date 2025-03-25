import React from "react";
import { Modal, StyleSheet, View, useColorScheme } from "react-native";
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

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        <MealDetailScreen
          mealId={mealId}
          mealType={mealType}
          onClose={onClose}
        />
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
});
