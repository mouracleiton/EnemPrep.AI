#!/bin/bash

# ENEM Prep.AI Flutter Run Script

echo "Running ENEM Prep.AI Flutter app..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "Flutter is not installed. Please install Flutter first."
    echo "Visit https://flutter.dev/docs/get-started/install for instructions."
    exit 1
fi

# Run Flutter app
flutter run
