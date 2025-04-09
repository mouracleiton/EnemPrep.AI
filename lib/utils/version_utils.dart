import 'dart:math';

class VersionUtils {
  // Compare two version strings
  static int compareVersions(String v1, String v2) {
    final v1Parts = v1.split('.').map(int.parse).toList();
    final v2Parts = v2.split('.').map(int.parse).toList();
    
    for (int i = 0; i < min(v1Parts.length, v2Parts.length); i++) {
      if (v1Parts[i] > v2Parts[i]) {
        return 1;
      } else if (v1Parts[i] < v2Parts[i]) {
        return -1;
      }
    }
    
    return v1Parts.length.compareTo(v2Parts.length);
  }
  
  // Check if a version is at least a minimum version
  static bool isVersionAtLeast(String version, String minVersion) {
    return compareVersions(version, minVersion) >= 0;
  }
  
  // Format a version string
  static String formatVersion(String version) {
    final parts = version.split('.');
    if (parts.length < 3) {
      // Pad with zeros if needed
      while (parts.length < 3) {
        parts.add('0');
      }
    }
    return parts.join('.');
  }
}
