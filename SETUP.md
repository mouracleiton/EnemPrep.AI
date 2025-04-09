# Setting Up the ENEM Prep.AI Flutter App

This document provides instructions on how to set up and run the ENEM Prep.AI Flutter application.

## Prerequisites

1. Install Flutter SDK (https://flutter.dev/docs/get-started/install)
2. Set up an IDE (VS Code or Android Studio recommended)
3. Set up Android SDK for Android development
4. Set up Xcode for iOS development (Mac only)

## Getting Started

1. Clone this repository
2. Navigate to the `enemprep_flutter` directory
3. Run `flutter pub get` to install dependencies
4. Run `flutter run` to start the app on a connected device or emulator

## Project Structure

- `lib/`: Contains the Dart code for the application
- `assets/`: Contains the assets used by the application
  - `assets/json/`: Contains the question data
  - `assets/images/`: Contains the images used in questions
  - `assets/fonts/`: Contains the fonts used in the application

## Building for Production

### Android

1. Navigate to the `enemprep_flutter` directory
2. Run `flutter build apk --release` to build an APK
3. The APK will be available at `build/app/outputs/flutter-apk/app-release.apk`

### iOS (Mac only)

1. Navigate to the `enemprep_flutter` directory
2. Run `flutter build ios --release` to build for iOS
3. Open the Xcode project at `ios/Runner.xcworkspace`
4. Use Xcode to archive and distribute the app

## Troubleshooting

If you encounter any issues, try the following:

1. Run `flutter clean` to clean the build
2. Run `flutter pub get` to reinstall dependencies
3. Restart your IDE
4. Check the Flutter doctor by running `flutter doctor -v`

For more information, refer to the Flutter documentation at https://flutter.dev/docs.
