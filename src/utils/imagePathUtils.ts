import ImagePathMapper from './ImagePathMapper';

export const IMAGE_DIR = 'assets/img';

/**
 * Gets the path to an image based on its filename
 * This function uses the new ImagePathMapper to find the correct path
 * @param filename The image filename
 * @returns The full path to the image
 */
export function getImagePath(filename: string): string {
  // Remove any path information and get clean filename
  const cleanFilename = filename.split('/').pop() || filename;

  // Ensure the filename has an extension
  const hasExtension = /\.(jpg|jpeg|png|gif)$/i.test(cleanFilename);
  const finalFilename = hasExtension ? cleanFilename : `${cleanFilename}.png`;

  // Use the ImagePathMapper to get the correct path
  return ImagePathMapper.getImagePath(finalFilename);
}

/**
 * Gets an alternative path for Android devices
 * @param filename The image filename
 * @returns An alternative path for Android devices
 */
export function getAlternativeAndroidPath(filename: string): string {
  const cleanFilename = filename.split('/').pop() || filename;

  // Get all alternative paths and return the first one for Android
  const alternativePaths = ImagePathMapper.getAlternativePaths(cleanFilename);
  return alternativePaths[0] || `file:///android_asset/assets/img/${cleanFilename}`;
}

/**
 * Validates if a path is a valid image path
 * @param path The path to validate
 * @returns True if the path is valid
 */
export function validateImagePath(path: string): boolean {
  // Check if path contains assets/img
  return path.includes('assets/img/');
}

/**
 * Ensures that a filename has the correct path prefix
 * @param filename The filename to check
 * @returns The filename with the correct path prefix
 */
export function ensureCorrectImagePath(filename: string): string {
  if (!filename.includes('assets/img/')) {
    // Use the ImagePathMapper to get the correct path
    return ImagePathMapper.getImagePath(filename);
  }
  return filename;
}