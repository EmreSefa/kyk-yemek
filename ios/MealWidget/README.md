# KYK Yemek iOS Widget

This directory contains the implementation of the iOS widget for KYK Yemek app using SwiftUI and WidgetKit.

## Overview

The widget displays meal information from KYK dormitories based on the time of day. It's available in three different sizes (small, medium, and large) and updates automatically throughout the day.

## Implementation

### Files

- **MealWidget.swift**: The main widget implementation, containing the widget provider and views
- **MealWidgetExtension.swift**: Entry point for the widget extension
- **Info.plist**: Configuration for the widget extension
- **MealWidget.entitlements**: Entitlements for sharing data with the main app

### Data Sharing

The widget uses the App Group capability to share data with the main app. The shared container identifier is `group.com.kykyemek.app`.

## Integration with React Native

The React Native app communicates with the widget through:

1. **MealWidgetService.swift**: Native module that provides the interface to update widgets
2. **MealWidgetService.m**: Objective-C bridge for the Swift module

## Development Setup

To work on the iOS widget:

1. Open the Xcode project in the `ios` directory
2. Make sure the App Group capability is enabled for both the main app and widget extension
3. The bundle identifier for the widget extension should be `com.kykyemek.app.MealWidget`

## Widget Sizes

- **Small**: Shows the meal type, date, location and one menu item
- **Medium**: Shows the meal type, date, location and up to 4 menu items
- **Large**: Shows the meal type, date, location and all menu items

## Widget Updates

The widget updates automatically every 6 hours. It also updates when:

- The user changes their selected city or dormitory
- The app is launched
- The user manually triggers an update

## Resources

- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
