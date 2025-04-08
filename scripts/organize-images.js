/**
 * Script to organize images into folders based on their filenames
 * 
 * This script will:
 * 1. Scan the assets/img directory for images
 * 2. Determine the appropriate subfolder based on the filename
 * 3. Move the image to the appropriate subfolder
 */

const fs = require('fs');
const path = require('path');

// Base directories
const IMG_DIR = path.join(__dirname, '..', 'assets', 'img');
const QUESTIONS_DIR = path.join(IMG_DIR, 'questions');
const COMMON_DIR = path.join(IMG_DIR, 'common');
const UI_DIR = path.join(IMG_DIR, 'ui');
const UI_ICONS_DIR = path.join(UI_DIR, 'icons');
const UI_BACKGROUNDS_DIR = path.join(UI_DIR, 'backgrounds');

// Create directories if they don't exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// Create all required directories
ensureDirectoryExists(QUESTIONS_DIR);
ensureDirectoryExists(COMMON_DIR);
ensureDirectoryExists(UI_ICONS_DIR);
ensureDirectoryExists(UI_BACKGROUNDS_DIR);

// Create year directories (2009-2023)
for (let year = 2009; year <= 2023; year++) {
  ensureDirectoryExists(path.join(QUESTIONS_DIR, year.toString()));
}

// Determine the appropriate subfolder for a file
const getSubfolder = (filename) => {
  // Skip SVG files and system files
  if (filename.endsWith('.svg') || filename.startsWith('.')) {
    return null;
  }
  
  // Skip files that are already in a subfolder
  if (filename.includes(path.sep)) {
    return null;
  }
  
  // UI images
  if (filename.includes('icon') || filename.includes('logo')) {
    return path.join(UI_DIR, 'icons');
  }
  
  if (filename.includes('background') || filename.includes('splash')) {
    return path.join(UI_DIR, 'backgrounds');
  }
  
  // Try to extract year from filename patterns
  const yearMatch = filename.match(/^(\d{4})/);
  if (yearMatch && yearMatch[1]) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2009 && year <= 2023) {
      return path.join(QUESTIONS_DIR, year.toString());
    }
  }
  
  // UUID format (likely question images)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|gif)$/i;
  if (uuidPattern.test(filename)) {
    return QUESTIONS_DIR;
  }
  
  // MD5/hash format (likely question images)
  const hashPattern = /^[0-9a-f]{32}\.(png|jpg|jpeg|gif)$/i;
  if (hashPattern.test(filename)) {
    return QUESTIONS_DIR;
  }
  
  // Default to common folder
  return COMMON_DIR;
};

// Process all files in the img directory
const processFiles = () => {
  const files = fs.readdirSync(IMG_DIR);
  let movedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(IMG_DIR, file);
    
    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      return;
    }
    
    const subfolder = getSubfolder(file);
    if (!subfolder) {
      console.log(`Skipping: ${file}`);
      return;
    }
    
    const destPath = path.join(subfolder, file);
    
    // Skip if the file already exists in the destination
    if (fs.existsSync(destPath)) {
      console.log(`File already exists: ${destPath}`);
      return;
    }
    
    try {
      // Copy the file to the new location
      fs.copyFileSync(filePath, destPath);
      console.log(`Copied: ${file} -> ${subfolder}`);
      movedCount++;
    } catch (error) {
      console.error(`Error copying ${file}: ${error.message}`);
    }
  });
  
  console.log(`\nProcessed ${files.length} files, copied ${movedCount} files to subfolders.`);
  console.log('Original files were preserved in the assets/img directory.');
  console.log('\nTo remove the original files after verifying everything works, run:');
  console.log('node scripts/cleanup-images.js');
};

// Run the script
console.log('Starting image organization...');
processFiles();
console.log('Done!');
