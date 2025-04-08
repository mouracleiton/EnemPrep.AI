import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class ApiServerService {
  private serverProcess: any = null;
  private serverPort: number = 3000;
  private serverUrl: string = `http://localhost:${this.serverPort}`;
  private isServerRunning: boolean = false;
  private apiPath: string = '';
  private onServerStatusCallbacks: ((status: string) => void)[] = [];

  constructor() {
    this.setupApiPath();
  }

  /**
   * Setup the path to the API server
   */
  private async setupApiPath() {
    if (Platform.OS === 'web') {
      this.apiPath = '/enem-api';
    } else {
      // For mobile, we'll copy the API to the document directory
      this.apiPath = `${FileSystem.documentDirectory}enem-api`;

      // Check if the API is already copied
      const apiExists = await FileSystem.getInfoAsync(this.apiPath);
      if (!apiExists.exists) {
        // Copy the API from the bundle directory
        await FileSystem.makeDirectoryAsync(this.apiPath, { intermediates: true });
        // Note: This is a simplified version. In a real app, you'd need to
        // implement a way to copy the entire directory structure
      }
    }
  }

  /**
   * Start the API server
   */
  async startServer(): Promise<boolean> {
    if (this.isServerRunning) {
      console.log('Server is already running');
      return true;
    }

    try {
      this.updateServerStatus('Starting API server...');

      if (Platform.OS === 'web') {
        // For web, we can use Node.js to start the server
        this.serverProcess = await execAsync(`cd ${this.apiPath} && npm run dev`);
        this.isServerRunning = true;
        this.updateServerStatus('API server started on web');
        console.log('API server started on web');
        return true;
      } else {
        // For mobile, we can't run a Node.js server directly
        // Instead, we'll use a mock server or a pre-built API
        console.log('API server not supported on mobile, using mock data');
        this.isServerRunning = true;
        this.updateServerStatus('Using mock API data on mobile');
        return true;
      }
    } catch (error) {
      console.error('Failed to start API server:', error);
      this.updateServerStatus('Failed to start API server');
      return false;
    }
  }

  /**
   * Stop the API server
   */
  async stopServer(): Promise<boolean> {
    if (!this.isServerRunning) {
      console.log('Server is not running');
      return true;
    }

    try {
      this.updateServerStatus('Stopping API server...');

      if (Platform.OS === 'web' && this.serverProcess) {
        // Kill the server process
        this.serverProcess.kill();
        this.serverProcess = null;
      }

      this.isServerRunning = false;
      this.updateServerStatus('API server stopped');
      console.log('API server stopped');
      return true;
    } catch (error) {
      console.error('Failed to stop API server:', error);
      this.updateServerStatus('Failed to stop API server');
      return false;
    }
  }

  /**
   * Check if the server is running
   */
  isRunning(): boolean {
    return this.isServerRunning;
  }

  /**
   * Get the server URL
   */
  getServerUrl(): string {
    return this.serverUrl;
  }

  /**
   * Register a callback to be called when server status changes
   */
  onServerStatus(callback: (status: string) => void) {
    this.onServerStatusCallbacks.push(callback);
  }

  /**
   * Update server status and notify callbacks
   */
  private updateServerStatus(status: string) {
    this.onServerStatusCallbacks.forEach(callback => callback(status));
  }
}

export default new ApiServerService();
