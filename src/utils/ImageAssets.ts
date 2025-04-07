/**
 * This file provides a mapping of image filenames to require statements
 * This is the most reliable way to load images in React Native
 */

// Import images to use in the app
const placeholderImage = require('../../assets/images/question-icon.png');
const enemLogo = require('../../assets/images/enem-logo.png');
const enemLogo2x = require('../../assets/images/enem-logo@2x.png');
const enemLogo3x = require('../../assets/images/enem-logo@3x.png');
const studyIcon = require('../../assets/images/study-icon.png');
const lessonIcon = require('../../assets/images/lesson-icon.png');
const achievementBadge = require('../../assets/images/achievement-badge.png');
const appLogoText = require('../../assets/images/app-logo-text.png');
const background = require('../../assets/images/background.png');
const headerBackground = require('../../assets/images/header-background.png');

/**
 * Get the image source for a given filename
 * @param filename The image filename
 * @returns The image source
 */
export function getImageSource(filename: string | null) {
  if (!filename) return placeholderImage;

  try {
    // Extract just the filename without path
    const baseFilename = filename.split('/').pop();
    if (!baseFilename) return placeholderImage;

    // For now, return the placeholder image
    // In a production app, you would need to map all filenames to require statements
    // or use a dynamic require approach if supported
    return { uri: `asset:/img/${baseFilename}` };
  } catch (error) {
    console.error('Error getting image source:', error);
    return placeholderImage;
  }
}

export default {
  getImageSource,
  placeholderImage,
  enemLogo,
  enemLogo2x,
  enemLogo3x,
  studyIcon,
  lessonIcon,
  achievementBadge,
  appLogoText,
  background,
  headerBackground,
};
