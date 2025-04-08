import React from 'react';
import { View, StyleSheet } from 'react-native';
import MarkdownRenderer from './MarkdownRenderer';

interface QuestionContextProps {
  context: string | null;
  style?: any;
}

const QuestionContext: React.FC<QuestionContextProps> = ({ context, style }) => {
  if (!context) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <MarkdownRenderer content={context} />
    </View>
  );
};

// Estilos específicos para o componente
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});

export default QuestionContext;
