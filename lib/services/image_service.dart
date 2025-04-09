import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

import 'storage_service.dart';

class ImageService {
  final StorageService _storageService;
  final Map<String, String> _imagePathCache = {};
  final Logger _logger = Logger();

  ImageService(this._storageService);

  // Get image widget for a given filename
  Widget getImage(String? filename, {
    BoxFit fit = BoxFit.contain,
    double? width,
    double? height,
    Widget Function(BuildContext, String, dynamic)? errorBuilder,
  }) {
    if (filename == null || filename.isEmpty) {
      return _buildPlaceholder(width, height);
    }

    // Extract just the filename if it's a path
    final cleanFilename = _cleanFilename(filename);

    return FutureBuilder<String?>(
      future: _resolveImagePath(cleanFilename),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildLoadingPlaceholder(width, height);
        }

        if (snapshot.hasError || !snapshot.hasData || snapshot.data == null) {
          return _buildErrorPlaceholder(cleanFilename, width, height);
        }

        final imagePath = snapshot.data!;

        // Handle different image sources
        if (imagePath.startsWith('http')) {
          // Network image
          return CachedNetworkImage(
            imageUrl: imagePath,
            fit: fit,
            width: width,
            height: height,
            placeholder: (context, url) => _buildLoadingPlaceholder(width, height),
            errorWidget: (context, url, error) =>
              errorBuilder?.call(context, url, error) ??
              _buildErrorPlaceholder(cleanFilename, width, height),
          );
        } else if (imagePath.startsWith('assets/')) {
          // Asset image
          return Image.asset(
            imagePath,
            fit: fit,
            width: width,
            height: height,
            errorBuilder: (context, error, stackTrace) =>
              errorBuilder?.call(context, imagePath, error) ??
              _buildErrorPlaceholder(cleanFilename, width, height),
          );
        } else {
          // File image
          return Image.file(
            File(imagePath),
            fit: fit,
            width: width,
            height: height,
            errorBuilder: (context, error, stackTrace) =>
              errorBuilder?.call(context, imagePath, error) ??
              _buildErrorPlaceholder(cleanFilename, width, height),
          );
        }
      },
    );
  }

  // Clean filename by removing paths and query parameters
  String _cleanFilename(String filename) {
    // If the filename includes a path, extract just the filename part
    if (filename.contains('/')) {
      filename = filename.split('/').last;
    }

    // Remove any query parameters or hash fragments
    if (filename.contains('?')) {
      filename = filename.split('?').first;
    }
    if (filename.contains('#')) {
      filename = filename.split('#').first;
    }

    return filename;
  }

  // Resolve image path from various sources
  Future<String?> _resolveImagePath(String filename) async {
    // Check cache first
    if (_imagePathCache.containsKey(filename)) {
      return _imagePathCache[filename];
    }

    // Try different paths to find the image
    final possiblePaths = await _getAllPossiblePaths(filename);

    for (final path in possiblePaths) {
      try {
        if (path.startsWith('http')) {
          // For network images, we can't check if they exist beforehand
          _imagePathCache[filename] = path;
          return path;
        } else if (path.startsWith('assets/')) {
          // For asset images, try to load them
          try {
            await rootBundle.load(path);
            _imagePathCache[filename] = path;
            return path;
          } catch (e) {
            // Asset not found, continue to next path
            continue;
          }
        } else {
          // For file images, check if they exist
          final file = File(path);
          if (await file.exists()) {
            _imagePathCache[filename] = path;
            return path;
          }
        }
      } catch (e) {
        // Error checking this path, continue to next one
        _logger.d('Error checking path $path: $e');
      }
    }

    // If no path works, return null
    return null;
  }

  // Get all possible paths for an image
  Future<List<String>> _getAllPossiblePaths(String filename) async {
    final paths = <String>[];

    // Local paths
    final appDocDir = await getApplicationDocumentsDirectory();
    final cacheDir = await getTemporaryDirectory();

    // Add paths in order of preference
    paths.add('${_storageService.imagesPath}/$filename');
    paths.add('${appDocDir.path}/assets/images/$filename');
    paths.add('${cacheDir.path}/images/$filename');
    paths.add('assets/images/$filename');

    // Add network paths if the filename looks like it might be from enem.dev
    if (filename.contains('enem') || filename.contains('questao')) {
      paths.add('https://enem.dev/images/$filename');
    }

    return paths;
  }

  // Build a loading placeholder
  Widget _buildLoadingPlaceholder(double? width, double? height) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  // Build an error placeholder
  Widget _buildErrorPlaceholder(String filename, double? width, double? height) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.broken_image, color: Colors.red),
            const SizedBox(height: 8),
            Text(
              'Imagem não disponível',
              style: TextStyle(color: Colors.red[700]),
              textAlign: TextAlign.center,
            ),
            if (kDebugMode) ...[
              const SizedBox(height: 4),
              Text(
                filename,
                style: const TextStyle(fontSize: 10, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }

  // Build a placeholder for null images
  Widget _buildPlaceholder(double? width, double? height) {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: const Center(
        child: Icon(Icons.image_not_supported, color: Colors.grey),
      ),
    );
  }

  // Preload images for better performance
  Future<void> preloadImages(List<String> filenames) async {
    for (final filename in filenames) {
      try {
        final cleanFilename = _cleanFilename(filename);
        final path = await _resolveImagePath(cleanFilename);
        if (path != null) {
          // The path is now cached
          _logger.d('Preloaded image: $cleanFilename');
        }
      } catch (e) {
        _logger.w('Error preloading image $filename: $e');
      }
    }
  }

  // Clear the image cache
  void clearCache() {
    _imagePathCache.clear();
  }
}
