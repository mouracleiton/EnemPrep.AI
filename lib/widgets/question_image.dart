import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/image_service.dart';

class QuestionImage extends StatelessWidget {
  final String? filename;
  final double? width;
  final double? height;
  final BoxFit fit;

  const QuestionImage({
    super.key,
    required this.filename,
    this.width,
    this.height,
    this.fit = BoxFit.contain,
  });

  @override
  Widget build(BuildContext context) {
    if (filename == null || filename!.isEmpty) {
      return _buildPlaceholder();
    }

    final imageService = Provider.of<ImageService>(context);
    return imageService.getImage(
      filename,
      fit: fit,
      width: width,
      height: height,
      errorBuilder: (context, url, error) => _buildErrorWidget(),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: const Center(
        child: Icon(Icons.image_not_supported, color: Colors.grey),
      ),
    );
  }

  Widget _buildErrorWidget() {
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
            const Text(
              'Imagem não disponível',
              style: TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            Text(
              filename ?? '',
              style: const TextStyle(fontSize: 10, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
