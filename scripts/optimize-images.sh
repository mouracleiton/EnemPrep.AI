#!/bin/bash

# Script para otimizar imagens no diretório assets/img
# Compatível com aarch64 Linux

# Diretório de imagens
IMG_DIR="assets/img"

# Diretório temporário para backup
BACKUP_DIR="assets/img_backup"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar o progresso
show_progress() {
    local current=$1
    local total=$2
    local percent=$((current * 100 / total))
    local completed=$((percent / 2))
    local remaining=$((50 - completed))
    
    printf "\r[${GREEN}"
    printf "%0.s#" $(seq 1 $completed)
    printf "${NC}"
    printf "%0.s-" $(seq 1 $remaining)
    printf "] %d%% (%d/%d)" $percent $current $total
}

# Verificar se as ferramentas necessárias estão instaladas
check_tools() {
    echo -e "${BLUE}Verificando ferramentas necessárias...${NC}"
    
    local missing_tools=0
    
    if ! command -v pngquant &> /dev/null; then
        echo -e "${YELLOW}pngquant não encontrado. Algumas otimizações de PNG não serão realizadas.${NC}"
        missing_tools=$((missing_tools + 1))
    fi
    
    if ! command -v jpegoptim &> /dev/null; then
        echo -e "${YELLOW}jpegoptim não encontrado. Algumas otimizações de JPEG não serão realizadas.${NC}"
        missing_tools=$((missing_tools + 1))
    fi
    
    if ! command -v cwebp &> /dev/null; then
        echo -e "${YELLOW}cwebp não encontrado. Conversão para WebP não será realizada.${NC}"
        missing_tools=$((missing_tools + 1))
    fi
    
    if [ $missing_tools -eq 3 ]; then
        echo -e "${RED}Nenhuma ferramenta de otimização encontrada. Por favor, instale pelo menos uma:${NC}"
        echo "  - pngquant: para otimizar PNGs"
        echo "  - jpegoptim: para otimizar JPEGs"
        echo "  - cwebp: para converter para WebP"
        echo ""
        echo "No Arch Linux, você pode instalar com:"
        echo "  sudo pacman -S pngquant jpegoptim libwebp"
        exit 1
    fi
    
    echo -e "${GREEN}Ferramentas verificadas!${NC}"
}

# Criar backup do diretório de imagens
create_backup() {
    echo -e "${BLUE}Criando backup das imagens originais...${NC}"
    
    # Verificar se o diretório de backup já existe
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}Diretório de backup já existe. Deseja sobrescrever? (s/n)${NC}"
        read -r response
        if [[ "$response" =~ ^([sS])$ ]]; then
            rm -rf "$BACKUP_DIR"
        else
            echo -e "${RED}Operação cancelada pelo usuário.${NC}"
            exit 1
        fi
    fi
    
    # Criar diretório de backup
    mkdir -p "$BACKUP_DIR"
    
    # Copiar todas as imagens para o backup
    cp -r "$IMG_DIR"/* "$BACKUP_DIR"/
    
    echo -e "${GREEN}Backup criado em $BACKUP_DIR${NC}"
}

# Otimizar imagens PNG
optimize_png() {
    local png_files=($(find "$IMG_DIR" -type f -name "*.png"))
    local total_files=${#png_files[@]}
    local total_original_size=0
    local total_optimized_size=0
    
    echo -e "${BLUE}Otimizando ${total_files} arquivos PNG...${NC}"
    
    if [ $total_files -eq 0 ]; then
        echo -e "${YELLOW}Nenhum arquivo PNG encontrado.${NC}"
        return
    fi
    
    for ((i=0; i<$total_files; i++)); do
        local file="${png_files[$i]}"
        local original_size=$(stat -c%s "$file")
        total_original_size=$((total_original_size + original_size))
        
        # Otimizar com pngquant
        if command -v pngquant &> /dev/null; then
            pngquant --force --ext .png --speed 1 --quality 70-90 "$file" 2>/dev/null
        fi
        
        local optimized_size=$(stat -c%s "$file")
        total_optimized_size=$((total_optimized_size + optimized_size))
        
        # Mostrar progresso
        show_progress $((i+1)) $total_files
    done
    
    # Calcular economia
    local saved_size=$((total_original_size - total_optimized_size))
    local saved_percent=0
    if [ $total_original_size -gt 0 ]; then
        saved_percent=$((saved_size * 100 / total_original_size))
    fi
    
    echo -e "\n${GREEN}Otimização de PNG concluída!${NC}"
    echo -e "Tamanho original: $(numfmt --to=iec --suffix=B $total_original_size)"
    echo -e "Tamanho otimizado: $(numfmt --to=iec --suffix=B $total_optimized_size)"
    echo -e "Economia: $(numfmt --to=iec --suffix=B $saved_size) (${saved_percent}%)"
}

# Otimizar imagens JPEG
optimize_jpeg() {
    local jpeg_files=($(find "$IMG_DIR" -type f -name "*.jpg" -o -name "*.jpeg"))
    local total_files=${#jpeg_files[@]}
    local total_original_size=0
    local total_optimized_size=0
    
    echo -e "${BLUE}Otimizando ${total_files} arquivos JPEG...${NC}"
    
    if [ $total_files -eq 0 ]; then
        echo -e "${YELLOW}Nenhum arquivo JPEG encontrado.${NC}"
        return
    fi
    
    for ((i=0; i<$total_files; i++)); do
        local file="${jpeg_files[$i]}"
        local original_size=$(stat -c%s "$file")
        total_original_size=$((total_original_size + original_size))
        
        # Otimizar com jpegoptim
        if command -v jpegoptim &> /dev/null; then
            jpegoptim --strip-all --max=85 "$file" >/dev/null 2>&1
        fi
        
        local optimized_size=$(stat -c%s "$file")
        total_optimized_size=$((total_optimized_size + optimized_size))
        
        # Mostrar progresso
        show_progress $((i+1)) $total_files
    done
    
    # Calcular economia
    local saved_size=$((total_original_size - total_optimized_size))
    local saved_percent=0
    if [ $total_original_size -gt 0 ]; then
        saved_percent=$((saved_size * 100 / total_original_size))
    fi
    
    echo -e "\n${GREEN}Otimização de JPEG concluída!${NC}"
    echo -e "Tamanho original: $(numfmt --to=iec --suffix=B $total_original_size)"
    echo -e "Tamanho otimizado: $(numfmt --to=iec --suffix=B $total_optimized_size)"
    echo -e "Economia: $(numfmt --to=iec --suffix=B $saved_size) (${saved_percent}%)"
}

# Função principal
main() {
    echo -e "${BLUE}=== Otimização de Imagens para React Native ===${NC}"
    
    # Verificar ferramentas
    check_tools
    
    # Criar backup
    create_backup
    
    # Otimizar PNGs
    optimize_png
    
    # Otimizar JPEGs
    optimize_jpeg
    
    echo -e "\n${GREEN}Otimização concluída!${NC}"
    echo -e "Um backup das imagens originais foi salvo em: ${BACKUP_DIR}"
}

# Executar função principal
main
