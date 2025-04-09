import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';

import '../services/image_service.dart';
import '../utils/image_path_mapper.dart';

class MarkdownBody extends StatelessWidget {
  final String data;
  final TextStyle? style;
  
  const MarkdownBody({
    super.key,
    required this.data,
    this.style,
  });

  @override
  Widget build(BuildContext context) {
    // Process image paths in markdown
    final processedData = ImagePathMapper.processImagePathsInMarkdown(data);
    
    return Markdown(
      data: processedData,
      styleSheet: MarkdownStyleSheet(
        p: style ?? Theme.of(context).textTheme.bodyMedium,
        h1: Theme.of(context).textTheme.headlineMedium,
        h2: Theme.of(context).textTheme.titleLarge,
        h3: Theme.of(context).textTheme.titleMedium,
        blockquote: Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: Colors.grey[700],
          fontStyle: FontStyle.italic,
        ),
        code: Theme.of(context).textTheme.bodyMedium?.copyWith(
          fontFamily: 'monospace',
          backgroundColor: Colors.grey[200],
        ),
        codeblockDecoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      imageBuilder: (uri, title, alt) {
        // Extract filename from URI
        final filename = uri.toString().split('/').last;
        final imageService = Provider.of<ImageService>(context);
        
        return Container(
          margin: const EdgeInsets.symmetric(vertical: 8),
          child: imageService.getImage(
            filename,
            width: double.infinity,
            height: 200,
            fit: BoxFit.contain,
          ),
        );
      },
      onTapLink: (text, href, title) {
        // Handle link taps if needed
        debugPrint('Link tapped: $href');
      },
    );
  }
}
