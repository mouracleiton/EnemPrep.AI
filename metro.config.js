// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure large JSON files are properly handled
config.resolver.assetExts.push('json');

// Add additional asset extensions for images
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp');

// Ensure proper image processing
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Configure the asset resolver to include the img directory
config.resolver.extraNodeModules = {
  assets: path.resolve(__dirname, 'assets'),
  img: path.resolve(__dirname, 'assets/img'),
};

// Disable minification during development for better debugging
if (process.env.NODE_ENV !== 'production') {
  config.transformer.minifierConfig = {
    compress: {
      // Keep console logs in development
      drop_console: false,
      // Keep debuggers in development
      drop_debugger: false,
    },
  };
} else {
  // Configuração para minimizar o bundle em produção
  config.transformer.minifierConfig = {
    compress: {
      // Remover console.logs em produção
      drop_console: true,
      // Remover debuggers
      drop_debugger: true,
      // Remover código morto
      dead_code: true,
      // Remover código não utilizado
      unused: true,
      // Remover código inacessível
      conditionals: true,
    },
    mangle: {
      // Minimizar nomes de variáveis
      toplevel: true,
    },
  };
}

// Configuração para excluir arquivos grandes não utilizados
config.resolver.blacklistRE = /assets\/enem_data_with_lessons\.json$/;

// Configuração para otimizar o tamanho do bundle
config.maxWorkers = 2;
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Ensure that we can use asset:// protocol on Android
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;
