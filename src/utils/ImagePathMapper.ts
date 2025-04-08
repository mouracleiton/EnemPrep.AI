/**
 * ImagePathMapper.ts
 *
 * This utility maps image filenames to their correct paths in the assets directory.
 * It helps organize images by type and year, making it easier to manage and load them.
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Define the base paths for different platforms
const getBasePath = (): string => {
  if (Platform.OS === 'android') {
    return 'asset:/assets/img';
  } else if (Platform.OS === 'ios') {
    return `${FileSystem.bundleDirectory}assets/img`;
  } else {
    return 'assets/img';
  }
};

// For direct access to the root img directory
const getRootImagePath = (): string => {
  if (Platform.OS === 'android') {
    return 'asset:/assets/img';
  } else if (Platform.OS === 'ios') {
    return `${FileSystem.bundleDirectory}assets/img`;
  } else {
    return 'assets/img';
  }
};

// Define the folder structure
const FOLDER_STRUCTURE = {
  COMMON: 'common',
  UI: 'ui',
  UI_ICONS: 'ui/icons',
  UI_BACKGROUNDS: 'ui/backgrounds',
};

/**
 * Determines the appropriate subfolder for an image based on its filename
 * @param filename The image filename
 * @returns The subfolder path
 */
export const getImageSubfolder = (filename: string): string => {
  // UI images
  if (filename.includes('icon') || filename.includes('logo')) {
    return FOLDER_STRUCTURE.UI_ICONS;
  }

  if (filename.includes('background') || filename.includes('splash')) {
    return FOLDER_STRUCTURE.UI_BACKGROUNDS;
  }

  // Default: put in common folder
  return FOLDER_STRUCTURE.COMMON;
};

/**
 * Gets the full path to an image based on its filename
 * @param filename The image filename
 * @returns The full path to the image
 */
export const getImagePath = (filename: string): string => {
  if (!filename) return '';

  // Clean the filename (remove any path information)
  const cleanFilename = filename.split('/').pop() || filename;

  // Para simplificar, vamos retornar diretamente o caminho raiz
  return `${getBasePath()}/${cleanFilename}`;
};

/**
 * Gets alternative paths to try if the primary path fails
 * @param filename The image filename
 * @returns An array of alternative paths to try
 */
export const getAlternativePaths = (filename: string): string[] => {
  if (!filename) return [];

  const cleanFilename = filename.split('/').pop() || filename;
  const rootPath = getRootImagePath();

  return [
    // Try in the root img directory (original location)
    `${rootPath}/${cleanFilename}`,

    // Try in the common folder
    `${rootPath}/${FOLDER_STRUCTURE.COMMON}/${cleanFilename}`,

    // For Android, try with file:// protocol
    ...(Platform.OS === 'android' ? [
      `file:///android_asset/assets/img/${cleanFilename}`
    ] : [])
  ];
};

/**
 * Checks if a filename is an image file
 * @param filename The image filename
 * @returns True if the filename is an image file
 */
export const isImageFile = (filename: string): boolean => {
  if (!filename) return false;

  const cleanFilename = filename.split('/').pop() || filename;

  // Check if it's an image file by extension
  const imagePattern = /\.(png|jpg|jpeg|gif|svg)$/i;

  return imagePattern.test(cleanFilename);
};

/**
 * Gets the image source object for React Native Image component
 * @param filename The image filename
 * @returns The image source object
 */
export const getImageSource = (filename: string): { uri: string } | null => {
  if (!filename || !isImageFile(filename)) return null;

  const path = getImagePath(filename);
  return { uri: path };
};

export default {
  getImagePath,
  getAlternativePaths,
  isImageFile,
  getImageSource,
  getImageSubfolder,
};
