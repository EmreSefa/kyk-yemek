import { useColorScheme as useNativeColorScheme } from "react-native";
import { useEffect, useState } from "react";

export function useColorScheme() {
  const colorScheme = useNativeColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  useEffect(() => {
    setIsDark(colorScheme === "dark");
  }, [colorScheme]);

  return {
    colorScheme,
    isDark,
  };
}
