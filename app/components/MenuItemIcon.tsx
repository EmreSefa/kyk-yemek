import React from "react";
import { StyleSheet, View } from "react-native";
import { useColorScheme } from "react-native";

// Import all SVG icons as React components
import SoupIcon from "../../assets/icons/soup.svg";
import EggOmeletIcon from "../../assets/icons/eggomelet.svg";
import OliveIcon from "../../assets/icons/olive.svg";
import BagelIcon from "../../assets/icons/bagel.svg";
import SaladIcon from "../../assets/icons/salad.svg";
import PastryIcon from "../../assets/icons/pastry.svg";
import JamIcon from "../../assets/icons/jam.svg";
import HoneyIcon from "../../assets/icons/honey.svg";
import CakeIcon from "../../assets/icons/cake.svg";
import FruitIcon from "../../assets/icons/fruit.svg";
import NutellaIcon from "../../assets/icons/nutella.svg";
import TeaIcon from "../../assets/icons/tea.svg";
import CheeseIcon from "../../assets/icons/cheese.svg";
import MainDishIcon from "../../assets/icons/main-dish.svg";
import PastaIcon from "../../assets/icons/pasta.svg";
import RiceIcon from "../../assets/icons/rice.svg";
import CupcakeIcon from "../../assets/icons/cupcake.svg";
import YogurtIcon from "../../assets/icons/yogurt.svg";
import AyranIcon from "../../assets/icons/ayran.svg";
import TakeawayIcon from "../../assets/icons/takeaway.svg";
import PizzaIcon from "../../assets/icons/pizza-slice.svg";
import EmptyPlateIcon from "../../assets/icons/empty-plate.svg";

interface MenuItemIconProps {
  itemName: string;
  mealType: "BREAKFAST" | "DINNER";
  index: number;
  size?: number;
  isCaloriesRow?: boolean;
}

export function MenuItemIcon({
  itemName,
  mealType,
  index,
  size = 26,
  isCaloriesRow = false,
}: MenuItemIconProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Don't show any icon for calories row
  if (isCaloriesRow) {
    return null;
  }

  // Get background color based on meal type and item name
  const getBackgroundColor = (): string => {
    // Common case for both breakfast and dinner - first item is soup
    if (index === 0) {
      return isDark ? "#8B3E3E" : "#FFE4E4"; // Soup - light/dark red
    }

    // Breakfast specific colors
    if (mealType === "BREAKFAST") {
      const itemNameLower = itemName.toLowerCase();

      if (
        itemNameLower.includes("omlet") ||
        itemNameLower.includes("yumurta") ||
        itemNameLower.includes("menemen")
      ) {
        return isDark ? "#A57C1B" : "#FFF9C4"; // Egg - light/dark yellow
      } else if (itemNameLower.includes("zeytin")) {
        return isDark ? "#3D5272" : "#E3F2FD"; // Olive - light/dark blue
      } else if (
        itemNameLower.includes("simit") ||
        itemNameLower.includes("açma") ||
        itemNameLower.includes("poğaça")
      ) {
        return isDark ? "#B86E2C" : "#FFE0B2"; // Bagel - light/dark orange
      } else if (
        itemNameLower.includes("söğüş") ||
        itemNameLower.includes("salata") ||
        itemNameLower.includes("piyaz")
      ) {
        return isDark ? "#2F6143" : "#E8F5E9"; // Salad - light/dark green
      } else if (
        itemNameLower.includes("börek") ||
        itemNameLower.includes("böreği")
      ) {
        return isDark ? "#A25B41" : "#FFCCBC"; // Pastry - light/dark brown-orange
      } else if (
        itemNameLower.includes("reçel") ||
        itemNameLower.includes("pekmez")
      ) {
        return isDark ? "#A13671" : "#FCE4EC"; // Jam - light/dark pink
      } else if (itemNameLower.includes("bal")) {
        return isDark ? "#B59904" : "#FFF8E1"; // Honey - light/dark amber
      } else if (
        itemNameLower.includes("kek") ||
        itemNameLower.includes("pasta")
      ) {
        return isDark ? "#614385" : "#EDE7F6"; // Cake - light/dark purple
      } else if (
        itemNameLower.includes("elma") ||
        itemNameLower.includes("mandalina") ||
        itemNameLower.includes("muz") ||
        itemNameLower.includes("meyve")
      ) {
        return isDark ? "#01579B" : "#E1F5FE"; // Fruit - light/dark light blue
      } else if (itemNameLower.includes("çikolata")) {
        return isDark ? "#5D4037" : "#EFEBE9"; // Chocolate - light/dark brown
      } else if (
        itemNameLower.includes("çay") ||
        itemNameLower.includes("kahve")
      ) {
        return isDark ? "#654C3B" : "#D7CCC8"; // Tea/Coffee - light/dark brown-grey
      } else if (itemNameLower.includes("peynir")) {
        return isDark ? "#B5A13D" : "#FFF9C4"; // Cheese - light/dark light yellow
      }
    }
    // Dinner specific colors
    else if (mealType === "DINNER") {
      const itemNameLower = itemName.toLowerCase();

      // 2nd item is always main dish
      if (index === 1) {
        return isDark ? "#7B5B3E" : "#FFFDE7"; // Main dish - light/dark brown
      }

      // Check for specific food items
      if (itemNameLower.includes("salata")) {
        return isDark ? "#2E7D32" : "#E8F5E9"; // Salad - light/dark green
      }

      // 3rd item is either pasta, rice, or salad
      if (index === 2) {
        if (
          itemNameLower.includes("makarna") ||
          itemNameLower.includes("erişte")
        ) {
          return isDark ? "#E6B75D" : "#FFF8E1"; // Pasta - light/dark yellow
        } else if (itemNameLower.includes("pilav")) {
          return isDark ? "#E6D25D" : "#FFFDE7"; // Rice - light/dark light yellow
        }
      }
      // Other dinner items
      if (
        itemNameLower.includes("muhallebi") ||
        itemNameLower.includes("tatlı") ||
        itemNameLower.includes("baklava") ||
        itemNameLower.includes("güllaç") ||
        itemNameLower.includes("revani") ||
        itemNameLower.includes("trileçe") ||
        itemNameLower.includes("kadayıf") ||
        itemNameLower.includes("browni")
      ) {
        return isDark ? "#9C27B0" : "#F3E5F5"; // Dessert - light/dark purple
      } else if (itemNameLower.includes("yoğurt")) {
        return isDark ? "#0097A7" : "#E0F7FA"; // Yogurt - light/dark cyan
      } else if (itemNameLower.includes("ayran")) {
        return isDark ? "#0288D1" : "#E1F5FE"; // Ayran - light/dark light blue
      } else if (itemNameLower.includes("al götür")) {
        return isDark ? "#FFC107" : "#FFF8E1"; // Takeaway - light/dark amber
      } else if (itemNameLower.includes("pizza")) {
        return isDark ? "#E64A19" : "#FBE9E7"; // Pizza - light/dark orange
      }
    }

    // Default color if no match is found
    return isDark ? "#424242" : "#F5F5F5"; // Grey
  };

  const iconColor = isDark ? "#FFFFFF" : "#333333";
  const backgroundColor = getBackgroundColor();

  // Get the appropriate icon component based on meal type and item name
  const IconComponent = React.useMemo(() => {
    // Common case for both breakfast and dinner - first item is soup
    if (index === 0) {
      return SoupIcon;
    }

    // Breakfast specific icons
    if (mealType === "BREAKFAST") {
      const itemNameLower = itemName.toLowerCase();

      if (
        itemNameLower.includes("omlet") ||
        itemNameLower.includes("yumurta") ||
        itemNameLower.includes("menemen")
      ) {
        return EggOmeletIcon;
      } else if (itemNameLower.includes("zeytin")) {
        return OliveIcon;
      } else if (
        itemNameLower.includes("simit") ||
        itemNameLower.includes("açma") ||
        itemNameLower.includes("poğaça")
      ) {
        return BagelIcon;
      } else if (
        itemNameLower.includes("söğüş") ||
        itemNameLower.includes("salata") ||
        itemNameLower.includes("piyaz")
      ) {
        return SaladIcon;
      } else if (
        itemNameLower.includes("börek") ||
        itemNameLower.includes("böreği")
      ) {
        return PastryIcon;
      } else if (
        itemNameLower.includes("reçel") ||
        itemNameLower.includes("pekmez")
      ) {
        return JamIcon;
      } else if (itemNameLower.includes("bal")) {
        return HoneyIcon;
      } else if (
        itemNameLower.includes("kek") ||
        itemNameLower.includes("pasta")
      ) {
        return CakeIcon;
      } else if (
        itemNameLower.includes("elma") ||
        itemNameLower.includes("mandalina") ||
        itemNameLower.includes("muz") ||
        itemNameLower.includes("meyve")
      ) {
        return FruitIcon;
      } else if (itemNameLower.includes("çikolata")) {
        return NutellaIcon;
      } else if (
        itemNameLower.includes("çay") ||
        itemNameLower.includes("kahve")
      ) {
        return TeaIcon;
      } else if (itemNameLower.includes("peynir")) {
        return CheeseIcon;
      }
    }
    // Dinner specific icons
    else if (mealType === "DINNER") {
      const itemNameLower = itemName.toLowerCase();

      // Check for salad in any position
      if (itemNameLower.includes("salata")) {
        return SaladIcon;
      }

      // 2nd item is always main dish
      if (index === 1) {
        return MainDishIcon;
      }
      // 3rd item is either pasta, rice, or salad
      else if (index === 2) {
        if (
          itemNameLower.includes("makarna") ||
          itemNameLower.includes("erişte")
        ) {
          return PastaIcon;
        } else if (itemNameLower.includes("pilav")) {
          return RiceIcon;
        }
      }
      // Other dinner items
      else if (
        itemNameLower.includes("muhallebi") ||
        itemNameLower.includes("tatlı") ||
        itemNameLower.includes("baklava") ||
        itemNameLower.includes("güllaç") ||
        itemNameLower.includes("revani") ||
        itemNameLower.includes("trileçe") ||
        itemNameLower.includes("kadayıf") ||
        itemNameLower.includes("browni")
      ) {
        return CupcakeIcon;
      } else if (itemNameLower.includes("yoğurt")) {
        return YogurtIcon;
      } else if (itemNameLower.includes("ayran")) {
        return AyranIcon;
      } else if (itemNameLower.includes("al götür")) {
        return TakeawayIcon;
      } else if (itemNameLower.includes("pizza")) {
        return PizzaIcon;
      }
    }

    // Default icon if no match is found
    return EmptyPlateIcon;
  }, [mealType, itemName, index]);

  const iconSize = size * 0.7; // Make icon slightly smaller than container

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: backgroundColor,
          borderRadius: size / 2,
        },
      ]}
    >
      <IconComponent
        width={iconSize}
        height={iconSize}
        fill={iconColor}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  icon: {
    aspectRatio: 1,
  },
});
