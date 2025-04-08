const fs = require('fs');
const path = require('path');

// Define source and destination directories
const sourceDir = path.join(__dirname, 'enem-api');
const destDir = path.join(__dirname, 'assets', 'enem-api');

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Function to copy a directory recursively
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  // Process each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    // Skip node_modules and .git directories
    if (entry.name === 'node_modules' || entry.name === '.git') {
      console.log(`Skipping directory: ${sourcePath}`);
      continue;
    }

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied file: ${sourcePath} -> ${destPath}`);
    }
  }
}

// Start copying
console.log(`Copying enem-api from ${sourceDir} to ${destDir}...`);
copyDirectory(sourceDir, destDir);
console.log('Copy completed successfully!');
