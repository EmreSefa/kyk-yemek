# iOS Widget Integration Guide

This document outlines the steps required to integrate the KYK Yemek widget into the iOS app.

## Prerequisites

- Xcode 12 or newer
- iOS 14 or newer target
- React Native project with iOS setup

## Setup Steps

### 1. Create the Widget Extension

1. Open the Xcode project in the `ios` directory
2. Go to File > New > Target
3. Select "Widget Extension" under the "Application Extension" category
4. Name it "MealWidget" and make sure "Include Configuration Intent" is NOT checked
5. Set the language to Swift
6. Click "Finish"

### 2. Update Bundle Identifiers

1. Select the main app target and go to the "Signing & Capabilities" tab
2. Ensure the bundle identifier is set to `com.kykyemek.app`
3. Select the widget target and ensure its bundle identifier is `com.kykyemek.app.MealWidget`

### 3. Set Up App Groups

1. Select the main app target and go to the "Signing & Capabilities" tab
2. Click "+ Capability" and add "App Groups"
3. Add a new App Group with the identifier `group.com.kykyemek.app`
4. Select the widget target and repeat the process, adding the same App Group

### 4. Add Widget Files

1. Replace the default widget files with the files from this directory:
   - `MealWidget.swift`
   - `MealWidgetExtension.swift`
   - `Info.plist`
   - `MealWidget.entitlements`

### 5. Add Native Module Files

1. Add these files to the main app's iOS directory:
   - `MealWidgetService.swift`
   - `MealWidgetService.m`

### 6. Update the Main App's Entitlements

1. If it doesn't exist, create a file named `KykYemek.entitlements` in the main iOS directory
2. Add the App Group configuration as shown in the provided entitlements file

### 7. Link in Podfile

Ensure that your Podfile includes the WidgetKit framework. Add this to your app target:

```ruby
pod 'React-Core', :path => '../node_modules/react-native/', :subspecs => ['DevSupport', 'RCTWebSocket']
# Add these lines for widgets
target 'MealWidget' do
  pod 'WidgetKit'
  pod 'SwiftUI'
end
```

### 8. Install Pods

Run the following command:

```
cd ios && pod install
```

## Testing the Widget

1. Build and run the app on a simulator or device using Xcode
2. Add the widget to the home screen:
   - Press and hold on an empty area of the home screen
   - Tap the + button in the top-left corner
   - Search for "KYK Yemek"
   - Select and add the widget in your preferred size

## Troubleshooting

### Widget Not Appearing in Gallery

- Ensure the widget extension target is being built
- Check that the widget is properly declared in `MealWidget.swift`
- Make sure your app has been run at least once on the device

### Data Not Showing in Widget

- Verify that App Groups are properly set up for both targets
- Check that the shared UserDefaults are being written to by the app
- Confirm the widget is reading from the correct shared container

### Widget Not Updating

- Make sure the widget timeline is properly configured
- Verify that `WidgetCenter.shared.reloadAllTimelines()` is being called
- Ensure the app has permission to run in the background
