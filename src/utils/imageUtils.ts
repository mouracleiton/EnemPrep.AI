/**
 * Utility functions for handling image paths
 */
import { Platform } from 'react-native';

/**
 * Converts a remote image URL to a local asset path
 * @param url The remote image URL
 * @returns The local asset path
 */
export function getLocalImagePath(url: string | null): string | null {
  if (!url) return null;

  // Extract the filename from the URL
  const filename = url.split('/').pop();
  if (!filename) return null;

  // Return the local asset path
  return `../../assets/img/${filename}`;
}

/**
 * Gets the image source for a given image path
 * @param imagePath The image path
 * @returns The image source object
 */
export function getImageSource(imagePath: string | null) {
  if (!imagePath) return null;

  try {
    // Extract the filename from the path
    const filename = imagePath.split('/').pop();
    if (!filename) return null;

    // For local assets in the assets/img folder
    if (Platform.OS === 'android') {
      return { uri: `asset:/img/${filename}` };
    } else {
      // For iOS
      return { uri: `${filename}` };
    }
  } catch (error) {
    console.error('Error getting image source:', error);
    return null;
  }
}

/**
 * Gets the require statement for a specific image
 * This is a more reliable way to load images in React Native
 * @param filename The image filename
 * @returns The image source
 */
export function getImageRequire(imagePath: string | null) {
  if (!imagePath) return null;

  try {
    // Extract the filename from the path
    const filename = imagePath.split('/').pop();
    if (!filename) return null;

    // Return a placeholder image from our new assets
    // In a real app, you would need to map filenames to require statements
    // or use a dynamic require approach if supported
    return require('../../assets/images/question-icon.png');
  } catch (error) {
    console.error('Error getting image require:', error);
    return null;
  }
}

export default {
  getLocalImagePath,
  getImageSource,
  getImageRequire,
};
