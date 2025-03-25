import { format } from "date-fns";
import { tr } from "date-fns/locale";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the widget data structure
export interface WidgetMeal {
  id: number;
  mealType: "BREAKFAST" | "DINNER";
  mealDate: string;
  items: string[];
  cityName: string | null;
}

/**
 * Generate HTML for small widget
 */
export function renderSmallWidget(data: WidgetMeal | null = null): string {
  if (!data) {
    return `
      <div style="display: flex; align-items: center; justify-content: center; background-color: #FFFFFF; padding: 8px;">
        <p style="font-size: 13px; color: #777777; text-align: center;">Yemek bilgisi bulunamadı</p>
      </div>
    `;
  }

  const formattedDate = format(new Date(data.mealDate), "dd MMMM", {
    locale: tr,
  });
  const mealTypeText =
    data.mealType === "BREAKFAST" ? "Kahvaltı" : "Akşam Yemeği";

  return `
    <div style="display: flex; flex-direction: column; background-color: #FFFFFF; padding: 12px;">
      <p style="font-size: 16px; font-weight: bold; color: #252525; margin: 0;">${mealTypeText}</p>
      <p style="font-size: 13px; color: #555555; margin: 4px 0;">${formattedDate}</p>
      ${
        data.cityName
          ? `<p style="font-size: 11px; color: #777777; margin: 0;">${data.cityName}</p>`
          : ""
      }
    </div>
  `;
}

/**
 * Generate HTML for medium widget
 */
export function renderMediumWidget(data: WidgetMeal | null = null): string {
  if (!data) {
    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #FFFFFF; padding: 12px;">
        <p style="font-size: 14px; color: #e74c3c; font-weight: bold; text-align: center;">Yemek bilgisi bulunamadı</p>
        <p style="font-size: 12px; color: #777777; text-align: center; margin-top: 4px;">Lütfen uygulamayı açın ve yurt seçiminizi kontrol edin</p>
      </div>
    `;
  }

  const formattedDate = format(new Date(data.mealDate), "dd MMMM yyyy", {
    locale: tr,
  });
  const mealTypeText =
    data.mealType === "BREAKFAST" ? "Kahvaltı" : "Akşam Yemeği";

  // Display up to 3 items in the medium widget
  const displayItems = data.items.slice(0, 3);
  const hasMore = data.items.length > 3;

  let itemsHtml = "";
  displayItems.forEach((item) => {
    itemsHtml += `<p style="font-size: 13px; color: #333333; margin: 4px 0;">• ${item}</p>`;
  });

  if (hasMore) {
    itemsHtml += `<p style="font-size: 12px; color: #777777; font-style: italic; margin-top: 2px;">+ ${
      data.items.length - 3
    } diğer yemek</p>`;
  }

  return `
    <div style="display: flex; flex-direction: column; background-color: #FFFFFF; padding: 12px;">
      <div style="margin-bottom: 8px;">
        <p style="font-size: 16px; font-weight: bold; color: #252525; margin: 0;">${mealTypeText}</p>
        <p style="font-size: 12px; color: #555555; margin: 4px 0;">${formattedDate}</p>
        ${
          data.cityName
            ? `<p style="font-size: 11px; color: #777777; margin: 0;">${data.cityName}</p>`
            : ""
        }
      </div>
      
      <div style="display: flex; flex-direction: column;">
        ${itemsHtml}
      </div>
    </div>
  `;
}

/**
 * Generate HTML for large widget
 */
export function renderLargeWidget(data: WidgetMeal | null = null): string {
  if (!data) {
    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #FFFFFF; padding: 16px;">
        <p style="font-size: 14px; color: #e74c3c; font-weight: bold; text-align: center;">Yemek bilgisi bulunamadı</p>
        <p style="font-size: 12px; color: #777777; text-align: center; margin-top: 4px;">Lütfen uygulamayı açın ve yurt seçiminizi kontrol edin</p>
      </div>
    `;
  }

  const formattedDate = format(new Date(data.mealDate), "dd MMMM yyyy", {
    locale: tr,
  });
  const mealTypeText =
    data.mealType === "BREAKFAST" ? "Kahvaltı" : "Akşam Yemeği";

  let itemsHtml = "";
  if (data.items.length > 0) {
    data.items.forEach((item) => {
      itemsHtml += `<p style="font-size: 14px; color: #333333; margin: 6px 0;">• ${item}</p>`;
    });
  } else {
    itemsHtml = `<p style="font-size: 13px; color: #888888; font-style: italic; margin: 0;">Menü bilgisi bulunamadı</p>`;
  }

  return `
    <div style="display: flex; flex-direction: column; background-color: #FFFFFF; padding: 16px;">
      <div style="margin-bottom: 12px;">
        <p style="font-size: 18px; font-weight: bold; color: #252525; margin: 0;">${mealTypeText}</p>
        <p style="font-size: 14px; color: #555555; margin: 4px 0;">${formattedDate}</p>
        ${
          data.cityName
            ? `<p style="font-size: 12px; color: #777777; margin: 0;">${data.cityName}</p>`
            : ""
        }
      </div>
      
      <div style="display: flex; flex-direction: column;">
        ${itemsHtml}
      </div>
    </div>
  `;
}

/**
 * Load widget data from AsyncStorage
 */
export async function loadWidgetData(): Promise<WidgetMeal | null> {
  try {
    const widgetDataJson = await AsyncStorage.getItem("kyk_yemek_widget_data");
    if (widgetDataJson) {
      return JSON.parse(widgetDataJson);
    }
    return null;
  } catch (error) {
    console.error("Error loading widget data:", error);
    return null;
  }
}

// Widget configuration for export
export const widgetConfig = {
  name: "KYKYemekWidget",
  description: "KYK Yurdunuzdaki günlük yemek menüsünü gösterir.",
  smallWidget: renderSmallWidget,
  mediumWidget: renderMediumWidget,
  largeWidget: renderLargeWidget,
  loadData: loadWidgetData,
};
