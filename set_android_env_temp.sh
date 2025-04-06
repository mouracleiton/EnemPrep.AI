#!/bin/bash

# Set Android environment variables for the current session
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "Android SDK environment variables have been set for the current session."
echo "ANDROID_HOME is now set to: $ANDROID_HOME"
