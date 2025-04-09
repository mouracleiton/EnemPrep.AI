class ImagePathMapper {
  // Map a filename to various possible paths
  static List<String> getAllPossiblePaths(String filename) {
    final paths = <String>[];
    
    // Clean the filename
    final cleanFilename = _cleanFilename(filename);
    
    // Add paths in order of preference
    paths.add('assets/images/$cleanFilename');
    paths.add('assets/img/$cleanFilename');
    paths.add('assets/$cleanFilename');
    
    // Add network paths
    paths.add('https://enem.dev/images/$cleanFilename');
    
    return paths;
  }
  
  // Clean filename by removing paths and query parameters
  static String _cleanFilename(String filename) {
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
  
  // Process image paths in question context
  static String processImagePathsInMarkdown(String markdown) {
    if (markdown.isEmpty) return markdown;
    
    // Replace URLs with just the filename
    String processed = markdown.replaceAll(
      RegExp(r'!\[\]\((https:\/\/enem\.dev\/.*?\/|assets\/img\/|assets\/images\/)([^\/]+)\)'),
      '![](\$2)'
    );
    
    // Replace asset:/images/ references
    processed = processed.replaceAll(
      RegExp(r'!\[\]\((asset:\/images\/)([^\)]+)\)'),
      r'![](assets/images/$2)'
    );
    
    // Convert HTML img tags to Markdown
    processed = processed.replaceAll(
      RegExp(r'<img\s+src="([^"]+)"\s*\/>'),
      '![](\$1)'
    );
    
    return processed;
  }
}
