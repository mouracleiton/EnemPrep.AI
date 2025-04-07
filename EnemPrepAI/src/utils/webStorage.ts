/**
 * A simple web-compatible storage implementation
 */

// In-memory storage for web
const memoryStorage: Record<string, string> = {};

export const setItem = (key: string, value: string): Promise<void> => {
  try {
    // Try to use localStorage if available
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    } else {
      // Fallback to memory storage
      memoryStorage[key] = value;
    }
    return Promise.resolve();
  } catch (e) {
    // If localStorage throws (e.g., in private browsing mode), use memory storage
    memoryStorage[key] = value;
    return Promise.resolve();
  }
};

export const getItem = (key: string): Promise<string | null> => {
  try {
    // Try to use localStorage if available
    if (typeof localStorage !== 'undefined') {
      return Promise.resolve(localStorage.getItem(key));
    } else {
      // Fallback to memory storage
      return Promise.resolve(memoryStorage[key] || null);
    }
  } catch (e) {
    // If localStorage throws, use memory storage
    return Promise.resolve(memoryStorage[key] || null);
  }
};

export const removeItem = (key: string): Promise<void> => {
  try {
    // Try to use localStorage if available
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      // Fallback to memory storage
      delete memoryStorage[key];
    }
    return Promise.resolve();
  } catch (e) {
    // If localStorage throws, use memory storage
    delete memoryStorage[key];
    return Promise.resolve();
  }
};

export default {
  setItem,
  getItem,
  removeItem,
};
