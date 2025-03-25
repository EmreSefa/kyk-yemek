# KYK Yemek App

A mobile application for KYK dormitory students to view and track their meal schedules.

## Features

- View today's meal schedule (breakfast and dinner)
- Weekly meal calendar
- Meal nutritional information
- Notifications for meal times
- User preferences for dormitory and location
- Home screen widget showing current meal

## Setup

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

## Testing Notifications

To test notifications properly, you need to use a physical device:

```bash
# Run on physical device using Expo Go
npx expo start --tunnel
```

Then scan the QR code with your device.

### Testing Tips

1. **Immediate Testing**: To test notifications immediately during development:

   ```javascript
   // Add this code where you want to trigger a test notification
   await Notifications.scheduleNotificationAsync({
     content: {
       title: "Test Notification",
       body: "This is a test notification",
     },
     trigger: null, // Triggers immediately
   });
   ```

2. **Debugging**: Check the console for notification errors
3. **Permissions**: Verify permissions are properly granted on the device
4. **Settings**: Test the notification settings screen to ensure toggles work correctly

## Notification System

KYKYemek uses Expo Notifications to deliver daily meal reminders to users:

- Breakfast notifications at 7:00 AM
- Dinner notifications at 4:00 PM

### Setting Up Notification Icons

Before building for production, you need to create proper notification icons:

1. **Create a notification icon** (24x24dp with transparency for Android)

   - Save as `assets/notification-icon.png`
   - The icon should be simple and monochromatic
   - For Android, use a transparent PNG with white icon on a transparent background
   - For iOS, a square icon works best

2. **Optional: Add a notification sound**
   - Save as `assets/notification-sound.wav`
   - Keep the file size small (<100KB)

### Platform-Specific Setup

#### iOS

- You need a paid Apple Developer account
- Configure push notification capability in your app
- When submitting to App Store, declare notification usage in privacy section

#### Android

- Create a Firebase project and download google-services.json
- Place the file in the android/app directory before building
- Ensure the notification permissions are properly set in app.json

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Development Notes

- Uses Expo SDK 52
- React Native with TypeScript
- Supabase for backend services
- React Navigation for app navigation

## License

[MIT](LICENSE)

## Database

This project uses Supabase as the backend database service:

- All data operations are performed through the Supabase REST API
- Authentication is handled by Supabase Auth
- Meal data is stored in Supabase tables

## Turkish Character Support

Special attention has been paid to ensure proper encoding and display of Turkish characters (ç, ğ, ı, İ, ö, ş, ü) throughout the application and database.

## Home Screen Widget

KYKYemek provides a home screen widget that displays the current meal on your device's home screen:

- **Time-Based Display**:

  - Breakfast menu appears from 00:01 to 11:00 AM
  - Dinner menu appears from 11:00 AM to 00:01 AM (next day)

- **Widget Sizes**:
  - Small: Shows meal type and date
  - Medium: Shows meal type, date, and a few menu items
  - Large: Shows complete menu with all items

### Adding the Widget to Your Home Screen

#### iOS:

1. Long press on an empty area of your home screen
2. Tap the "+" button in the top-left corner
3. Search for "KYK Yemek"
4. Choose your preferred widget size
5. Tap "Add Widget"

#### Android:

1. Long press on an empty area of your home screen
2. Tap "Widgets"
3. Find "KYK Yemek" in the list
4. Choose your preferred widget size
5. Place it on your home screen

### Widget Updates

The widget updates automatically:

- Every time you open the app
- Every 15 minutes when the app is in the background
- When you change your dormitory selection
