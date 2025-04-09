#!/bin/bash

# ENEM Prep.AI Flutter Setup Script

echo "Setting up ENEM Prep.AI Flutter project..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "Flutter is not installed. Please install Flutter first."
    echo "Visit https://flutter.dev/docs/get-started/install for instructions."
    exit 1
fi

# Get Flutter dependencies
echo "Installing Flutter dependencies..."
flutter pub get

# Create necessary directories if they don't exist
mkdir -p assets/images
mkdir -p assets/json
mkdir -p assets/fonts

# Check if assets are present
if [ ! -f "assets/json/questions.json" ]; then
    echo "Warning: questions.json not found in assets/json/"
    echo "Please make sure to copy your question data to assets/json/questions.json"
fi

if [ ! -f "assets/json/questions_encrypted.json" ]; then
    echo "Warning: questions_encrypted.json not found in assets/json/"
    echo "Please make sure to copy your encrypted question data to assets/json/questions_encrypted.json"
fi

# Check for font files
if [ ! -f "assets/fonts/Roboto-Regular.ttf" ] || [ ! -f "assets/fonts/Roboto-Bold.ttf" ] || [ ! -f "assets/fonts/Roboto-Italic.ttf" ]; then
    echo "Warning: Some Roboto font files are missing."
    echo "Please make sure to download the Roboto font files and place them in assets/fonts/"
fi

# Fix Android configuration
echo "Fixing Android configuration..."
./fix_android.sh

# Run Flutter doctor to check for issues
echo "Running Flutter doctor to check for issues..."
flutter doctor -v

echo "Setup complete!"
echo "You can now run the app with 'flutter run'"
