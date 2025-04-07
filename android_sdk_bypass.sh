#!/bin/bash

# Create a temporary Android SDK directory structure
mkdir -p /tmp/android-sdk/platform-tools
mkdir -p /tmp/android-sdk/tools/bin
mkdir -p /tmp/android-sdk/emulator

# Create empty files to satisfy basic checks
touch /tmp/android-sdk/platform-tools/adb
chmod +x /tmp/android-sdk/platform-tools/adb

# Set Android environment variables for the current session
export ANDROID_HOME=/tmp/android-sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "Temporary Android SDK environment variables have been set for the current session."
echo "ANDROID_HOME is now set to: $ANDROID_HOME"

# Run the Expo web command
npx expo start --web
