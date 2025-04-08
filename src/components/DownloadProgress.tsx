import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'expo-progress';

interface DownloadProgressProps {
  progress: number;
  status: string;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({ progress, status }) => {
  return (
    <View style={styles.container}>
      <Progress.Bar 
        progress={progress / 100} 
        width={300}
        color="#4287f5"
      />
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.percentage}>{Math.round(progress)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  status: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  percentage: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
});