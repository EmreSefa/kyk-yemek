import React from "react";
import { View, StyleSheet, Image } from "react-native";

interface IconProps {
  size?: number;
  tintColor?: string;
}

// SVG paths to PNGs or other image formats
const ICON_PATHS = {
  soup: require("../../../assets/icons/empty-plate.png"),
  eggomelet: require("../../../assets/icons/empty-plate.png"),
  olive: require("../../../assets/icons/empty-plate.png"),
  bagel: require("../../../assets/icons/empty-plate.png"),
  salad: require("../../../assets/icons/empty-plate.png"),
  pastry: require("../../../assets/icons/empty-plate.png"),
  jam: require("../../../assets/icons/empty-plate.png"),
  honey: require("../../../assets/icons/empty-plate.png"),
  cake: require("../../../assets/icons/empty-plate.png"),
  fruit: require("../../../assets/icons/empty-plate.png"),
  nutella: require("../../../assets/icons/empty-plate.png"),
  tea: require("../../../assets/icons/empty-plate.png"),
  cheese: require("../../../assets/icons/empty-plate.png"),
  "main-dish": require("../../../assets/icons/empty-plate.png"),
  pasta: require("../../../assets/icons/empty-plate.png"),
  rice: require("../../../assets/icons/empty-plate.png"),
  cupcake: require("../../../assets/icons/empty-plate.png"),
  yogurt: require("../../../assets/icons/empty-plate.png"),
  ayran: require("../../../assets/icons/empty-plate.png"),
  takeaway: require("../../../assets/icons/empty-plate.png"),
  "pizza-slice": require("../../../assets/icons/empty-plate.png"),
  "empty-plate": require("../../../assets/icons/empty-plate.png"),
};

export const getIconForFoodItem = (
  itemName: string,
  mealType: "BREAKFAST" | "DINNER",
  index: number,
  size = 24,
  isDark = false
): React.ReactNode => {
  const tintColor = isDark ? "#FFFFFF" : "#333333";

  let iconKey: keyof typeof ICON_PATHS = "empty-plate";

  // Common case for both breakfast and dinner - first item is soup
  if (index === 0) {
    iconKey = "soup";
    return <Icon type={iconKey} size={size} tintColor={tintColor} />;
  }

  // Breakfast specific icons
  if (mealType === "BREAKFAST") {
    const itemNameLower = itemName.toLowerCase();

    if (
      itemNameLower.includes("omlet") ||
      itemNameLower.includes("yumurta") ||
      itemNameLower.includes("menemen")
    ) {
      iconKey = "eggomelet";
    } else if (itemNameLower.includes("zeytin")) {
      iconKey = "olive";
    } else if (
      itemNameLower.includes("simit") ||
      itemNameLower.includes("açma") ||
      itemNameLower.includes("poğaça")
    ) {
      iconKey = "bagel";
    } else if (
      itemNameLower.includes("söğüş") ||
      itemNameLower.includes("salata") ||
      itemNameLower.includes("piyaz")
    ) {
      iconKey = "salad";
    } else if (
      itemNameLower.includes("börek") ||
      itemNameLower.includes("böreği")
    ) {
      iconKey = "pastry";
    } else if (
      itemNameLower.includes("reçel") ||
      itemNameLower.includes("pekmez")
    ) {
      iconKey = "jam";
    } else if (itemNameLower.includes("bal")) {
      iconKey = "honey";
    } else if (
      itemNameLower.includes("kek") ||
      itemNameLower.includes("pasta")
    ) {
      iconKey = "cake";
    } else if (
      itemNameLower.includes("elma") ||
      itemNameLower.includes("mandalina") ||
      itemNameLower.includes("muz") ||
      itemNameLower.includes("meyve")
    ) {
      iconKey = "fruit";
    } else if (itemNameLower.includes("çikolata")) {
      iconKey = "nutella";
    } else if (
      itemNameLower.includes("çay") ||
      itemNameLower.includes("kahve")
    ) {
      iconKey = "tea";
    } else if (itemNameLower.includes("peynir")) {
      iconKey = "cheese";
    }
  }
  // Dinner specific icons
  else if (mealType === "DINNER") {
    const itemNameLower = itemName.toLowerCase();

    // 2nd item is always main dish
    if (index === 1) {
      iconKey = "main-dish";
    }
    // 3rd item is either pasta, rice, or salad
    else if (index === 2) {
      if (
        itemNameLower.includes("makarna") ||
        itemNameLower.includes("erişte")
      ) {
        iconKey = "pasta";
      } else if (itemNameLower.includes("pilav")) {
        iconKey = "rice";
      } else if (itemNameLower.includes("salata")) {
        iconKey = "salad";
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
      iconKey = "cupcake";
    } else if (itemNameLower.includes("yoğurt")) {
      iconKey = "yogurt";
    } else if (itemNameLower.includes("ayran")) {
      iconKey = "ayran";
    } else if (itemNameLower.includes("al götür")) {
      iconKey = "takeaway";
    } else if (itemNameLower.includes("pizza")) {
      iconKey = "pizza-slice";
    }
  }

  return <Icon type={iconKey} size={size} tintColor={tintColor} />;
};

export const Icon: React.FC<IconProps & { type: keyof typeof ICON_PATHS }> = ({
  type,
  size = 24,
  tintColor = "#333333",
}) => {
  const source = ICON_PATHS[type];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={source}
        style={[
          styles.icon,
          {
            width: size,
            height: size,
            tintColor,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
