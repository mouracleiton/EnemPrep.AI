import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import ImagePathMapper from '../utils/ImagePathMapper';

interface ImageDebuggerProps {
  filename: string;
}

const ImageDebugger: React.FC<ImageDebuggerProps> = ({ filename }) => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkImagePaths();
  }, [filename]);

  const checkImagePaths = async () => {
    const info: string[] = [];
    info.push(`Checking image: ${filename}`);

    // Clean filename
    const cleanFilename = filename.split('/').pop() || filename;
    info.push(`Clean filename: ${cleanFilename}`);

    // Check ImagePathMapper paths
    try {
      const imagePath = ImagePathMapper.getImagePath(cleanFilename);
      info.push(`ImagePathMapper path: ${imagePath}`);
    } catch (e) {
      info.push(`Error getting ImagePathMapper path: ${e}`);
    }

    // Check alternative paths
    try {
      const alternativePaths = ImagePathMapper.getAlternativePaths(cleanFilename);
      info.push(`Alternative paths (${alternativePaths.length}):`);
      alternativePaths.forEach((path, index) => {
        info.push(`  ${index + 1}. ${path}`);
      });
    } catch (e) {
      info.push(`Error getting alternative paths: ${e}`);
    }

    // Check if file exists in various locations
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // Check document directory
      try {
        const docPath = `${FileSystem.documentDirectory}assets/img/${cleanFilename}`;
        const docInfo = await FileSystem.getInfoAsync(docPath);
        info.push(`Document directory: ${docPath} - Exists: ${docInfo.exists}`);
      } catch (e) {
        info.push(`Error checking document directory: ${e}`);
      }

      // Check document directory with questions subfolder
      try {
        const docQuestionsPath = `${FileSystem.documentDirectory}assets/img/questions/${cleanFilename}`;
        const docQuestionsInfo = await FileSystem.getInfoAsync(docQuestionsPath);
        info.push(`Document questions directory: ${docQuestionsPath} - Exists: ${docQuestionsInfo.exists}`);
      } catch (e) {
        info.push(`Error checking document questions directory: ${e}`);
      }

      // Check bundle directory
      if (Platform.OS === 'ios') {
        try {
          const bundlePath = `${FileSystem.bundleDirectory}assets/img/${cleanFilename}`;
          const bundleInfo = await FileSystem.getInfoAsync(bundlePath);
          info.push(`Bundle directory: ${bundlePath} - Exists: ${bundleInfo.exists}`);
        } catch (e) {
          info.push(`Error checking bundle directory: ${e}`);
        }

        // Check bundle directory with questions subfolder
        try {
          const bundleQuestionsPath = `${FileSystem.bundleDirectory}assets/img/questions/${cleanFilename}`;
          const bundleQuestionsInfo = await FileSystem.getInfoAsync(bundleQuestionsPath);
          info.push(`Bundle questions directory: ${bundleQuestionsPath} - Exists: ${bundleQuestionsInfo.exists}`);
        } catch (e) {
          info.push(`Error checking bundle questions directory: ${e}`);
        }
      }
    }

    setDebugInfo(info);
  };

  if (!expanded) {
    return (
      <View style={styles.collapsedContainer}>
        <Button 
          title="Debug Image" 
          onPress={() => setExpanded(true)} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Debug Info</Text>
      <ScrollView style={styles.scrollView}>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.infoText}>{info}</Text>
        ))}
      </ScrollView>
      <Button 
        title="Hide Debug" 
        onPress={() => setExpanded(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    maxHeight: 300,
  },
  collapsedContainer: {
    marginVertical: 5,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scrollView: {
    maxHeight: 250,
  },
  infoText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default ImageDebugger;
