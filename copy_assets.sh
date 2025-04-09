#!/bin/bash

# ENEM Prep.AI Asset Copy Script

echo "Copying assets from original project to Flutter project..."

# Check if the original assets directory exists
if [ ! -d "../assets" ]; then
    echo "Error: Original assets directory not found."
    echo "Please make sure the original project is in the parent directory."
    exit 1
fi

# Create necessary directories if they don't exist
mkdir -p assets/images
mkdir -p assets/json
mkdir -p assets/fonts

# Copy JSON files
echo "Copying JSON files..."
cp ../assets/questions.json assets/json/
cp ../assets/questions_encrypted.json assets/json/

# Copy images (this might take a while)
echo "Copying images..."
cp -r ../assets/images/* assets/images/

# Copy fonts
echo "Copying fonts..."
if [ -d "../assets/fonts" ]; then
    cp -r ../assets/fonts/* assets/fonts/
fi

# Copy app icons
echo "Copying app icons..."
cp ../assets/icon.png assets/
cp ../assets/splash.png assets/
cp ../assets/logo.png assets/

# Copy app icons to Android resources
echo "Copying app icons to Android resources..."
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

cp assets/icon.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp assets/icon.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png

echo "Asset copy complete!"
