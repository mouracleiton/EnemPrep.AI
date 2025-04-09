#!/bin/bash

# ENEM Prep.AI Flutter Build Script

echo "Building ENEM Prep.AI Flutter app..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "Flutter is not installed. Please install Flutter first."
    echo "Visit https://flutter.dev/docs/get-started/install for instructions."
    exit 1
fi

# Build options
echo "Select build option:"
echo "1. Android APK"
echo "2. Android App Bundle"
echo "3. iOS (Mac only)"
echo "4. Web"

read -p "Enter option (1-4): " option

case $option in
    1)
        echo "Building Android APK..."
        flutter build apk --release
        echo "APK built successfully! Find it at build/app/outputs/flutter-apk/app-release.apk"
        ;;
    2)
        echo "Building Android App Bundle..."
        flutter build appbundle --release
        echo "App Bundle built successfully! Find it at build/app/outputs/bundle/release/app-release.aab"
        ;;
    3)
        echo "Building for iOS..."
        flutter build ios --release --no-codesign
        echo "iOS build completed. Open ios/Runner.xcworkspace in Xcode to archive and distribute."
        ;;
    4)
        echo "Building for Web..."
        flutter build web --release
        echo "Web build completed. Find it at build/web/"
        ;;
    *)
        echo "Invalid option. Exiting."
        exit 1
        ;;
esac

echo "Build complete!"
