/**
 * Constants used across widget implementation
 */

// Storage keys for widget data
export const STORAGE_KEYS = {
  WIDGET_DATA: "kyk_yemek_widget_data",
  LAST_UPDATE: "kyk_yemek_widget_last_update",
};

// Update intervals (in milliseconds)
export const UPDATE_INTERVALS = {
  DEFAULT: 6 * 60 * 60 * 1000, // 6 hours
  MINIMUM: 30 * 60 * 1000, // 30 minutes
};

// Widget sizes
export const WIDGET_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

// Background task name
export const WIDGET_UPDATE_TASK = "WIDGET_UPDATE_TASK";

// Time ranges for different meal types (24-hour format)
export const MEAL_TIME_RANGES = {
  BREAKFAST: {
    START: 5, // 5:00 AM
    END: 10, // 10:00 AM
  },
  LUNCH: {
    START: 10, // 10:00 AM
    END: 16, // 4:00 PM
  },
  DINNER: {
    START: 16, // 4:00 PM
    END: 23, // 11:00 PM
  },
};
