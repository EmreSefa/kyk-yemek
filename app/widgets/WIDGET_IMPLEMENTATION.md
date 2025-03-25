# KYK Yemek Widget Implementation

This document outlines the implementation details for the KYK Yemek home screen widget.

## Overview

The KYK Yemek widget displays the current meal menu based on the time of day:

- Breakfast menu from 00:01 to 11:00
- Dinner menu from 11:00 to 00:01

## Architecture

### Data Flow

1. The React Native app prepares meal data using the `widgetService.ts`
2. Data is stored in `AsyncStorage` with the key `kyk_yemek_widget_data` for cross-component access
3. Native modules read this data and update the widgets

### Android Implementation

The Android widget implementation uses standard Android App Widget architecture:

1. **Widget Provider** (`MealWidgetProvider.java`):

   - Handles widget updates
   - Formats and displays data
   - Manages different layouts based on widget size

2. **Widget Service** (`MealWidgetService.java`):

   - Provides a factory for creating list items in the widget
   - Reads data from SharedPreferences

3. **Configuration Activity** (`MealWidgetConfigureActivity.java`):

   - Allows users to configure widget settings
   - Triggers initial widget setup

4. **Native Module Bridge** (`MealWidgetModule.java`):

   - Enables JavaScript to trigger native widget updates
   - Provides methods for managing widget data

5. **Boot Receiver** (`BootCompletedReceiver.java`):
   - Refreshes widgets when device restarts

### React Native Components

1. **WidgetService** (`widgetService.ts`):

   - Fetches meal data based on current time
   - Prepares data for widget consumption
   - Stores data in AsyncStorage

2. **WidgetManager** (`WidgetManager.ts`):

   - Handles initialization of widgets
   - Sets up periodic updates
   - Provides an interface for widget operations

3. **Widget Initializer** (in `App.tsx`):
   - Initializes widgets when app starts
   - Sets up periodic updates

## Widget Sizes and Content

The widget is available in three sizes:

1. **Small**:

   - Displays meal type and date
   - Minimal footprint on home screen

2. **Medium**:

   - Displays meal type, date, and up to 3 menu items
   - Shows a count of additional items

3. **Large**:
   - Displays meal type, date, and all menu items
   - Complete meal information

## User Experience

### Adding the Widget

1. Long-press on the home screen
2. Select "Widgets" or similar option
3. Find "KYK Yemek" widget
4. Choose widget size (small, medium, or large)
5. Configure preferences if prompted
6. Widget appears on home screen

### Update Frequency

- Widgets update automatically every 30 minutes
- Widgets update when the app is launched
- Widgets can be manually refreshed with a tap and hold gesture

## Technical Details

### Permissions

The widget requires the following permissions:

- `RECEIVE_BOOT_COMPLETED`: For updating widgets after device restart

### Resources

- Widget layouts are defined in XML
- Strings are stored in `strings.xml` for localization
- Custom backgrounds and preview images are provided

## Future Improvements

1. Add support for iOS widgets using WidgetKit
2. Implement widget customization options (theme, font size)
3. Add caching for offline access
4. Optimize update frequency based on user patterns
