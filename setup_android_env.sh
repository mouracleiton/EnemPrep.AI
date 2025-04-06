#!/bin/bash

# Add Android SDK environment variables to .zshrc
echo "# Android SDK configuration" >> ~/.zshrc
echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.zshrc
echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.zshrc
echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.zshrc
echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> ~/.zshrc
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.zshrc

# Also set them for the current session
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "Android SDK environment variables have been set up."
echo "Please restart your terminal or run 'source ~/.zshrc' to apply the changes."
