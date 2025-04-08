/**
 * Script to clean up original images after they've been organized
 * 
 * This script will:
 * 1. Scan the assets/img directory for images
 * 2. Check if the image exists in a subfolder
 * 3. If it does, remove the original file
 * 
 * WARNING: Only run this after verifying that the organize-images.js script
 * worked correctly and all images are accessible in the app.
 */

const fs = require('fs');
const path = require('path');

// Base directories
const IMG_DIR = path.join(__dirname, '..', 'assets', 'img');
const QUESTIONS_DIR = path.join(IMG_DIR, 'questions');
const COMMON_DIR = path.join(IMG_DIR, 'common');
const UI_DIR = path.join(IMG_DIR, 'ui');

// Check if a file exists in any subfolder
const existsInSubfolder = (filename) => {
  // Check in questions directory (including year subfolders)
  if (fs.existsSync(path.join(QUESTIONS_DIR, filename))) {
    return true;
  }
  
  // Check in year subfolders
  for (let year = 2009; year <= 2023; year++) {
    if (fs.existsSync(path.join(QUESTIONS_DIR, year.toString(), filename))) {
      return true;
    }
  }
  
  // Check in common directory
  if (fs.existsSync(path.join(COMMON_DIR, filename))) {
    return true;
  }
  
  // Check in UI directories
  if (fs.existsSync(path.join(UI_DIR, 'icons', filename)) || 
      fs.existsSync(path.join(UI_DIR, 'backgrounds', filename))) {
    return true;
  }
  
  return false;
};

// Process all files in the img directory
const cleanupFiles = () => {
  const files = fs.readdirSync(IMG_DIR);
  let removedCount = 0;
  let skippedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(IMG_DIR, file);
    
    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      return;
    }
    
    // Skip SVG files and system files
    if (file.endsWith('.svg') || file.startsWith('.')) {
      console.log(`Skipping: ${file} (system file or SVG)`);
      skippedCount++;
      return;
    }
    
    if (existsInSubfolder(file)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Removed: ${file}`);
        removedCount++;
      } catch (error) {
        console.error(`Error removing ${file}: ${error.message}`);
      }
    } else {
      console.log(`Keeping: ${file} (not found in subfolders)`);
      skippedCount++;
    }
  });
  
  console.log(`\nProcessed ${files.length} files, removed ${removedCount} files, kept ${skippedCount} files.`);
};

// Confirm before running
console.log('WARNING: This script will remove original image files from assets/img that have been copied to subfolders.');
console.log('Make sure you have verified that the organize-images.js script worked correctly and all images are accessible in the app.');
console.log('');
console.log('To continue, type "yes" and press Enter. To cancel, press Ctrl+C.');

// Read user input
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('> ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    console.log('Starting cleanup...');
    cleanupFiles();
    console.log('Done!');
  } else {
    console.log('Cleanup cancelled.');
  }
  readline.close();
});
