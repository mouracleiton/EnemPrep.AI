// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure large JSON files are properly handled
config.resolver.assetExts.push('json');

// Add additional asset extensions for images
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp');

// Ensure proper image processing
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Configure the asset resolver to include the img directory
config.resolver.extraNodeModules = {
  assets: path.resolve(__dirname, 'assets'),
  img: path.resolve(__dirname, 'assets/img'),
};

// Exclude parent directory to avoid naming collisions
config.watchFolders = [path.resolve(__dirname)];
config.resolver.blockList = [/..\/package.json$/];

module.exports = config;
