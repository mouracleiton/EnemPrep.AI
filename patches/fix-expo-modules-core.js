const fs = require('fs');
const path = require('path');

// Path to the ExpoModulesCorePlugin.gradle file
const pluginPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'android',
  'ExpoModulesCorePlugin.gradle'
);

// Read the file
let content = fs.readFileSync(pluginPath, 'utf8');

// Fix the issue with the release property
content = content.replace(
  'from components.release',
  'from components.getByName("release")'
);

// Write the file back
fs.writeFileSync(pluginPath, content);

console.log('Fixed ExpoModulesCorePlugin.gradle');
