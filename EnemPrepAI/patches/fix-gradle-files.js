const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all build.gradle files in node_modules
const findCommand = 'find node_modules -name "build.gradle" | grep -v "node_modules/react-native/"';
const buildGradleFiles = execSync(findCommand, { encoding: 'utf8' }).split('\n').filter(Boolean);

console.log(`Found ${buildGradleFiles.length} build.gradle files to check`);

let fixedFiles = 0;

buildGradleFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains the problematic code
    if (content.includes('from components.release')) {
      // Fix the issue
      const fixedContent = content.replace(
        /from components\.release/g,
        'from components.getByName("release")'
      );
      
      // Write the fixed content back
      fs.writeFileSync(filePath, fixedContent);
      fixedFiles++;
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log(`Fixed ${fixedFiles} build.gradle files`);

// Also fix the ExpoModulesCorePlugin.gradle file
const pluginPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-modules-core',
  'android',
  'ExpoModulesCorePlugin.gradle'
);

try {
  let content = fs.readFileSync(pluginPath, 'utf8');
  
  // Fix the issue with the release property
  if (content.includes('from components.release')) {
    content = content.replace(
      /from components\.release/g,
      'from components.getByName("release")'
    );
    
    // Write the file back
    fs.writeFileSync(pluginPath, content);
    console.log('Fixed ExpoModulesCorePlugin.gradle');
  }
} catch (error) {
  console.error(`Error processing ExpoModulesCorePlugin.gradle:`, error.message);
}
