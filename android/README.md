# Android Configuration for ENEM Prep.AI Flutter App

This directory contains the Android-specific configuration for the ENEM Prep.AI Flutter application.

## Structure

- `app/`: Contains the Android application code
  - `src/main/`: Contains the main source code
    - `java/com/enemprepai/app/`: Contains the Java code
      - `MainActivity.java`: The main activity for the Flutter app
      - `MainApplication.java`: The application class for the Flutter app
    - `res/`: Contains the resources
      - `drawable/`: Contains the drawable resources
      - `mipmap-*/`: Contains the app icons
      - `values/`: Contains the string resources

## Building

The Android app is built using Gradle. The build configuration is defined in the following files:

- `build.gradle`: The project-level build file
- `app/build.gradle`: The app-level build file
- `settings.gradle`: The settings file
- `gradle.properties`: The Gradle properties file
- `gradle/wrapper/gradle-wrapper.properties`: The Gradle wrapper properties file

## Troubleshooting

If you encounter issues with the Android build, try the following:

1. Run `./fix_android.sh` to fix common Android configuration issues
2. Run `flutter clean` to clean the build
3. Run `flutter pub get` to reinstall dependencies
4. Run `flutter doctor -v` to check for issues with the Flutter installation
5. Run `flutter build apk --verbose` to see detailed build logs

## Notes

- The app uses the Flutter v2 embedding, which is the recommended way to integrate Flutter into Android apps
- The app uses the AndroidX libraries, which are the recommended way to use Android support libraries
- The app requires Android 4.1 (API level 16) or higher
