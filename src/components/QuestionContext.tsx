import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuestionImage from './QuestionImage';

interface QuestionContextProps {
  context: string | null;
  style?: any;
}

const QuestionContext: React.FC<QuestionContextProps> = ({ context, style }) => {
  if (!context) {
    return null;
  }

  // Process the context to handle enem.dev URLs
  const processedContext = processContext(context);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.contextText}>{processedContext}</Text>
    </View>
  );
};

/**
 * Process the context to handle image URLs
 * @param context The context text
 * @returns The processed context text
 */
const processContext = (context: string): string => {
  // Replace enem.dev URLs with local image references
  // Example: ![](https://enem.dev/2009/questions/164/fbf84d66-498d-4521-8b27-9a164c60237d.jpg)
  // to ![](local:fbf84d66-498d-4521-8b27-9a164c60237d.jpg)
  let processedContext = context.replace(/!\[\]\(https:\/\/enem\.dev\/.*?\/([^\/]+)\)/g, '![](local:$1)');

  // Also handle assets/img/ format
  // Example: ![](assets/img/fbf84d66-498d-4521-8b27-9a164c60237d.jpg)
  // to ![](local:fbf84d66-498d-4521-8b27-9a164c60237d.jpg)
  processedContext = processedContext.replace(/!\[\]\(assets\/img\/([^\/]+)\)/g, '![](local:$1)');

  return processedContext;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  contextText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default QuestionContext;
