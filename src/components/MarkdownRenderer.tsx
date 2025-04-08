import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import SafeImage from './SafeImage';
import ImageDebugger from './ImageDebugger';

interface MarkdownRendererProps {
  content: string;
  style?: any;
}

/**
 * Component to render Markdown content with proper image handling
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, style }) => {
  if (!content) {
    return null;
  }

  // Processa o conteúdo para garantir que as imagens estejam no formato Markdown correto
  const processContent = (text: string): string => {
    let processedText = text;
    console.log('Processing content:', processedText);

    // 1. Converter tags <img> para sintaxe Markdown
    processedText = processedText.replace(/<img\s+src="([^"]+)"[^>]*>/g, (match, src) => {
      console.log(`Converting <img> tag to markdown: ${src}`);
      return `![](${src})`;
    });

    // 2. Detectar nomes de arquivo de imagem soltos e convertê-los para sintaxe Markdown
    const imageRegex = /\b[\w-]+\.(png|jpg|jpeg|gif|svg)\b/g;
    processedText = processedText.replace(imageRegex, (match) => {
      // Verificar se já está dentro de uma sintaxe Markdown
      const prevChars = processedText.substring(Math.max(0, processedText.indexOf(match) - 4), processedText.indexOf(match));
      if (prevChars.includes('](')) {
        return match; // Já está em formato Markdown, não modificar
      }
      console.log(`Converting standalone image filename to markdown: ${match}`);
      return `![](${match})`; // Converter para formato Markdown
    });

    // 3. Garantir que URLs de imagem completas estejam no formato Markdown
    processedText = processedText.replace(
      /(https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|svg))(\s|$)/g,
      (match, url) => {
        console.log(`Converting URL to markdown: ${url}`);
        return `![](${url}) `;
      }
    );

    // 4. Converter URLs do enem.dev para nomes de arquivo locais
    processedText = processedText.replace(
      /!\[\]\(https?:\/\/enem\.dev\/[^\)]*\/([^\)\/]+)\)/g,
      (match, filename) => {
        console.log(`Converting enem.dev URL to local filename: ${filename}`);
        return `![](${filename})`;
      }
    );

    // 5. Converter caminhos assets/img/ para apenas o nome do arquivo
    processedText = processedText.replace(
      /!\[\]\(assets\/img\/([^\)]+)\)/g,
      (match, filename) => {
        console.log(`Converting assets/img path to filename: ${filename}`);
        return `![](${filename})`;
      }
    );

    console.log('Processed content:', processedText);
    return processedText;
  };

  const processedContent = processContent(content);

  const [debugMode, setDebugMode] = useState(false);

  const renderers = {
    image: (props: any) => {
      const { src } = props;

      // Remove qualquer caminho, deixando só o nome do arquivo
      const filename = src.split('/').pop();

      // Verifica se é um arquivo de imagem válido
      const isImageFile = /\.(png|jpg|jpeg|gif|svg)$/i.test(filename);

      if (isImageFile) {
        console.log(`Rendering image: ${filename} from markdown`);
        return (
          <View style={styles.imageContainer}>
            <TouchableOpacity
              onLongPress={() => setDebugMode(!debugMode)}
              activeOpacity={0.9}
            >
              <SafeImage
                filename={filename}
                style={styles.markdownImage}
                resizeMode="contain"
              />
              <Text style={styles.imageCaption}>{filename}</Text>
            </TouchableOpacity>
            {debugMode && <ImageDebugger filename={filename} />}
          </View>
        );
      }

      return null;
    },
    // Você pode adicionar outros renderizadores aqui se necessário
  };

  return (
    <View style={[styles.container, style]}>
      <Markdown
        style={markdownStyles}
        renderers={renderers}
      >
        {processedContent}
      </Markdown>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  markdownImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageCaption: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
});

// Styles for the Markdown component
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 4,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
    paddingLeft: 10,
    marginLeft: 10,
    fontStyle: 'italic',
  },
};

export default MarkdownRenderer;
