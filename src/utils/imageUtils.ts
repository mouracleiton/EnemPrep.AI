/**
 * Utility functions for handling image paths
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

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

/**
 * Get the URI for an image by filename
 * @param filename The filename of the image
 * @returns The URI of the image
 */
export async function getImageUri(filename: string): Promise<string | null> {
  if (!filename) return null;

  // Clean up the filename if it has any prefixes
  let cleanFilename = filename;
  if (cleanFilename.startsWith('local:')) {
    cleanFilename = cleanFilename.replace('local:', '');
  }

  // If the filename already includes a path, extract just the filename
  if (cleanFilename.includes('/')) {
    const parts = cleanFilename.split('/');
    cleanFilename = parts[parts.length - 1];
  }

  try {
    // For mobile platforms, try to load from document directory first
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Try document directory with assets/img path
      const docDirPath = `${FileSystem.documentDirectory}assets/img/${cleanFilename}`;
      const docDirInfo = await FileSystem.getInfoAsync(docDirPath);

      if (docDirInfo.exists) {
        console.log(`Found image at document directory: ${docDirPath}`);
        return docDirPath;
      }

      // Try document directory directly
      const simplePath = `${FileSystem.documentDirectory}${cleanFilename}`;
      const simpleInfo = await FileSystem.getInfoAsync(simplePath);

      if (simpleInfo.exists) {
        console.log(`Found image at simple path: ${simplePath}`);
        return simplePath;
      }

      // Try bundle directory
      const bundlePath = `${FileSystem.bundleDirectory}assets/img/${cleanFilename}`;
      const bundleInfo = await FileSystem.getInfoAsync(bundlePath);

      if (bundleInfo.exists) {
        console.log(`Found image at bundle directory: ${bundlePath}`);
        return bundlePath;
      }

      // Try with the app's assets directory
      // For Android, try multiple protocols
      if (Platform.OS === 'android') {
        // Try with asset:// protocol first (works better on newer Android versions)
        const assetPath = `asset:/assets/img/${cleanFilename}`;
        console.log(`Trying with Android asset path: ${assetPath}`);
        return assetPath;
      } else {
        // For iOS and other platforms
        console.log(`Trying with app assets directory: assets/img/${cleanFilename}`);
        return `assets/img/${cleanFilename}`;
      }
    }

    // For web or as a fallback
    return `assets/img/${cleanFilename}`;
  } catch (e) {
    console.error('Error getting image URI:', e);
    return null;
  }
}

export default {
  getLocalImagePath,
  getImageSource,
  getImageRequire,
  getImageUri,
};
