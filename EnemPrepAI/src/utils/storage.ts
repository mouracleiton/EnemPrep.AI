import AsyncStorage from '@react-native-async-storage/async-storage';
import webStorage from './webStorage';

// Use AsyncStorage if available, otherwise use webStorage
let storage: {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
};

try {
  // Check if AsyncStorage is available
  if (AsyncStorage) {
    storage = AsyncStorage;
  } else {
    storage = webStorage;
  }
} catch (e) {
  // If AsyncStorage is not available, use webStorage
  storage = webStorage;
}

// Utility functions for storage
export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await storage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.error('Error storing data:', e);
    return false;
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await storage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error retrieving data:', e);
    return null;
  }
};

export const removeData = async (key: string) => {
  try {
    await storage.removeItem(key);
    return true;
  } catch (e) {
    console.error('Error removing data:', e);
    return false;
  }
};

export default {
  storeData,
  getData,
  removeData,
};
