import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import DataService from './src/services/DataService';
import ApiServerService from './src/services/ApiServerService';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Carregando...');
  const [apiStatus, setApiStatus] = useState('');

  useEffect(() => {
    // Start the API server
    const startApi = async () => {
      // Register for API server status updates
      ApiServerService.onServerStatus((status) => {
        setApiStatus(status);
      });

      // Start the API server
      await ApiServerService.startServer();
    };

    startApi();

    // Register for loading status updates
    DataService.onLoadingStatus((status) => {
      setLoadingStatus(status);
    });

    // Register for data loaded event
    DataService.onDataLoaded(() => {
      setIsLoading(false);
    });

    // Clean up when component unmounts
    return () => {
      ApiServerService.stopServer();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>{loadingStatus}</Text>
        {apiStatus ? <Text style={styles.apiStatusText}>{apiStatus}</Text> : null}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  apiStatusText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
