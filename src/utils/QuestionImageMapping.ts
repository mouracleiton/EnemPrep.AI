// Arquivo gerado automaticamente
const imageMapping: Record<string, any> = {
  // Add any static image mappings here if needed
};

/**
 * Get the image resource for a given filename
 * @param filename The filename of the image to get
 * @returns The image resource or null if not found
 */
export const getQuestionImage = (filename: string): any => {
  // Check if the image exists in our mapping
  const keys = Object.keys(imageMapping);
  const matchingKey = keys.find(key => key.toLowerCase() === filename.toLowerCase());

  if (matchingKey) {
    return imageMapping[matchingKey];
  }

  // If not found in mapping, return null
  return null;
};

export default imageMapping;
