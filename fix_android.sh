#!/bin/bash

# ENEM Prep.AI Android Fix Script

echo "Fixing Android configuration for Flutter project..."

# Create necessary directories if they don't exist
mkdir -p android/app/src/main/java/com/enemprepai/app
mkdir -p android/app/src/main/res/values
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
mkdir -p android/gradle/wrapper

# Copy app icons to Android resources
echo "Copying app icons to Android resources..."
cp assets/icon.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png

# Create round icons
cp assets/icon.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
cp assets/icon.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
cp assets/icon.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
cp assets/icon.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
cp assets/icon.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png

echo "Android configuration fixed!"
