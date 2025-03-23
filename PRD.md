# KYKYemek Mobile App - Product Requirements Document

## 1. Overview

KYKYemek is a mobile application designed to help students in KYK (Kredi ve Yurtlar Kurumu) dormitories track and view their meal schedules. The app provides an easy-to-use interface for accessing breakfast and dinner menus, nutritional information, and managing preferences based on the user's dormitory and location.

## 2. Target Audience

- College students living in KYK dormitories across Turkey
- Dormitory administrators and kitchen staff
- Students interested in planning their meals and tracking nutritional information

## 3. User Stories

### Core Features

As a student:

- I want to view today's meal menu for breakfast and dinner so I can plan my day
- I want to see the meal schedule for the entire week so I can plan ahead
- I want to set my dormitory and city preferences so I get relevant meal information
- I want to receive notifications before meals so I don't miss them
- I want to view nutritional information for each meal item so I can make healthy choices

### Advanced Features

As a student:

- I want to rate meals so I can provide feedback to kitchen staff
- I want to save favorite meals so I can track when they are served again
- I want to filter meals based on dietary preferences (vegetarian, etc.)
- I want to view meal history and upcoming meals in a calendar format

## 4. Technical Architecture

### Database Schema

The app uses Supabase with the following structure:

- **cities**: Stores city information
- **dormitories**: Stores dormitory information, linked to cities
- **meals**: Stores meal schedules (breakfast/dinner) by date for each dorm/city
- **meal_items**: Stores individual food items for each meal with nutritional info
- **users**: Stores user profile information and preferences

### Tech Stack

- **Frontend**: React Native/Expo for cross-platform mobile development
- **Backend**: Supabase for backend services (auth, database, storage)
- **State Management**: React Context with hooks
- **Navigation**: React Navigation
- **Styling**: React Native styling with potential Tailwind CSS integration

## 5. Screens & User Flow

### Onboarding Flow

1. **Welcome Screen** - App introduction and value proposition
2. **Authentication Screen** - Sign in with email or phone
3. **Preferences Setup** - Select city and dormitory

### Main App Flow

1. **Home Screen** - Today's meals with quick access to meal information
2. **Weekly Menu** - Calendar view of the week's meals
3. **Meal Detail** - Detailed view of a specific meal with all items and nutritional info
4. **Profile** - User preferences, settings, and favorite meals
5. **Notifications** - Manage meal reminders and notification preferences

## 6. Feature Breakdown

### Authentication & User Management

- Email/phone authentication
- User profile management
- City and dormitory preferences

### Meal Information

- Today's meal display (breakfast/dinner)
- Weekly meal schedule
- Detailed meal information with nutritional data
- Search and filter functionality

### User Preferences

- Favorite meals
- Dietary preferences
- Notification settings

### Feedback System

- Meal ratings
- Comments and suggestions
- Report missing or incorrect information

## 7. UI/UX Requirements

- Clean, modern interface with easy navigation
- Responsive design that works on all device sizes
- Dark mode support
- Accessibility features for users with disabilities
- Offline functionality for viewing saved meals

## 8. Performance Requirements

- Fast app startup (<2 seconds)
- Smooth transitions between screens
- Efficient data loading with caching
- Low memory footprint

## 9. Security Requirements

- Secure user authentication
- Data encryption for sensitive information
- GDPR compliance for European users
- Regular security audits

## 10. Deployment & Release Strategy

- Phased rollout starting with beta testers
- Initial release with core features
- Regular updates with new features based on user feedback
- Continuous integration and delivery pipeline

## 11. Analytics & Monitoring

- User engagement metrics
- Feature usage tracking
- Error reporting and monitoring
- Performance analytics

## 12. Future Enhancements

- Integration with university payment systems
- Community features for meal sharing and social interaction
- Nutritionist consultation features
- Meal suggestion based on dietary preferences

## 13. Success Metrics

- User acquisition and retention rates
- Daily and weekly active users
- Feature engagement percentages
- User satisfaction ratings
- App store ratings and reviews
