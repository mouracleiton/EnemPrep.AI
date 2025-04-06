# ENEM Lesson Generator

Este script gera aulas personalizadas para questões do ENEM usando o modelo local Gemma 3.

## Requisitos

- Python 3.8+
- Bibliotecas: transformers, torch, sentencepiece
- Pelo menos 4GB de RAM (8GB recomendado)
- GPU opcional, mas recomendada para melhor desempenho

## Instalação

1. Clone este repositório
2. Instale as dependências necessárias:

```bash
# Se estiver usando um ambiente virtual
pip install transformers torch sentencepiece tqdm

# Se estiver usando o pip do sistema
pip3 install --user transformers torch sentencepiece tqdm

# Se estiver no Arch Linux
sudo pacman -S python-transformers python-pytorch python-sentencepiece python-tqdm
```

## Uso

Execute o script principal:

```bash
python generate_lessons.py
```

### Opções

- `--file`: Caminho para o arquivo JSON (padrão: `enem_data.json`)
- `--batch-size`: Número de questões a processar em cada lote (padrão: 10)
- `--start-index`: Índice para começar o processamento (padrão: 0)
- `--verbose`: Ativa saída detalhada
- `--test`: Testa o modelo Gemma 3
- `--resume`: Retoma automaticamente do último checkpoint sem perguntar
- `--no-checkpoint`: Ignora checkpoints existentes e começa do início
- `--delay`: Atraso entre chamadas do modelo em segundos (padrão: 0.5)

Exemplo:

```bash
python generate_lessons.py --batch-size 20 --start-index 100
```

## Recursos

- Processamento em lotes para evitar perda de progresso
- Mecanismo de fallback para lidar com falhas do modelo
- Sistema de checkpoint para retomar de onde parou
- Salvamento automático após cada lote
- Barra de progresso para acompanhamento
- Geração de aulas totalmente offline usando o modelo Gemma 3

## Estrutura do JSON

O script adiciona um campo `lesson` a cada questão no arquivo JSON original.
