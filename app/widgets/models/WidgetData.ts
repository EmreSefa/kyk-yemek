/**
 * Data types for widget implementation
 */

/**
 * Widget meal data structure
 */
export interface WidgetMeal {
  /** Type of meal (breakfast, lunch, dinner) */
  mealType: "breakfast" | "lunch" | "dinner";

  /** Date of the meal in YYYY-MM-DD format */
  date: string;

  /** Menu items */
  menu: string[];

  /** City/Location name */
  location: string;

  /** Whether the widget has data to display */
  hasData: boolean;
}

/**
 * Configuration for widget appearance
 */
export interface WidgetConfig {
  /** Background color for the widget */
  backgroundColor: string;

  /** Text color for the widget */
  textColor: string;

  /** Accent color for highlights */
  accentColor: string;
}

/**
 * Complete widget data stored in AsyncStorage
 */
export interface WidgetStorageData {
  /** Last update timestamp */
  lastUpdate: string;

  /** City ID associated with the data */
  cityId: number;

  /** Location name */
  location: string;

  /** Today's meals */
  meals: {
    breakfast?: WidgetMeal;
    lunch?: WidgetMeal;
    dinner?: WidgetMeal;
  };

  /** Widget configuration */
  config: WidgetConfig;
}
