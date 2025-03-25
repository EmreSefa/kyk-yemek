# KYK Yemek Widget Implementation

This directory contains the implementation of home screen widgets for the KYK Yemek app.

## Overview

The widget displays the current meal menu based on time of day for the user's selected dormitory. It automatically updates throughout the day and allows users to see meal information without opening the app.

## Directory Structure

```
app/widgets/
├── models/              # Data models and interfaces
├── utils/               # Utility functions for widget management
│   ├── widgetConstants.ts  # Constants used in widget implementation
│   ├── widgetDebug.ts      # Debugging utilities
│   ├── widgetEvents.ts     # Event handling for widget updates
│   ├── widgetTheme.ts      # Theme support for widgets
│   └── updateWidget.ts     # Widget update logic
├── WidgetManager.ts     # Core manager for widget lifecycle
└── MealWidget.tsx       # React Native widget component

ios/MealWidget/         # iOS widget implementation
├── MealWidget.swift     # Main widget implementation
├── MealWidgetExtension.swift  # Widget entry point
└── Info.plist           # Widget configuration
```

## Key Components

### WidgetManager.ts

The central manager for widget operations, responsible for:

- Initializing widgets
- Updating widget data
- Managing widget lifecycle

### Data Flow

1. The app initializes widgets on startup via the `useWidgets` hook
2. Widget data is fetched and stored in AsyncStorage
3. Native modules handle the display of widget data on the home screen
4. Background tasks periodically update widget data

## Platform Support

### Android

- Full implementation with small, medium, and large widget sizes
- Native Java files implement the AppWidgetProvider
- XML layouts define the widget appearance

### iOS

- SwiftUI implementation with WidgetKit
- Available in small, medium, and large sizes
- Adapts to light/dark mode automatically
- Shares data with the main app via App Group

## Development

### Adding New Widget Features

1. Update widget data models in `models/WidgetData.ts`
2. Modify the widget service as needed
3. Update native implementations for the target platform

### Debugging

Use the debugging utilities in `widgetDebug.ts`:

```typescript
import { logWidgetData, clearWidgetData } from "../widgets/utils/widgetDebug";

// Log current widget data to console
await logWidgetData();

// Clear widget data (useful for troubleshooting)
await clearWidgetData();
```

## Testing Widgets

### Android

1. Build and install the app
2. Long press on the home screen
3. Select "Widgets" from the menu
4. Find the KYK Yemek widget and add it to your home screen

### iOS

1. Build and install the app
2. Long press on the home screen
3. Tap the "+" button to open the widget gallery
4. Search for "KYK Yemek" and add the widget
5. Choose the desired size (small, medium, or large)

## Future Improvements

- Widget configuration options
- Widget customization (colors, layout)
- Additional widget sizes and layouts
- Real-time updates

## Resources

- [react-native-widget-extension](https://github.com/react-native-widget-extension)
- [Android AppWidgets Documentation](https://developer.android.com/develop/ui/views/appwidgets)
- [iOS WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
