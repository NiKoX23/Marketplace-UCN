#!/bin/bash

set -e

# --- Detectar herramienta de compose disponible ---
if command -v podman-compose &>/dev/null; then
    COMPOSE="podman-compose"
    RUNTIME="podman"
elif command -v podman &>/dev/null && podman compose version &>/dev/null 2>&1; then
    COMPOSE="podman compose"
    RUNTIME="podman"
elif command -v docker-compose &>/dev/null; then
    COMPOSE="docker-compose"
    RUNTIME="docker"
elif command -v docker &>/dev/null && docker compose version &>/dev/null 2>&1; then
    COMPOSE="docker compose"
    RUNTIME="docker"
else
    echo "[!] ERROR: No se encontró podman-compose ni docker-compose. Por favor instala uno de ellos."
    echo "    Arch: sudo pacman -S podman podman-compose"
    echo "    Ubuntu/Debian: sudo apt install podman podman-compose"
    echo "    Fedora: sudo dnf install podman podman-compose"
    exit 1
fi

echo "[+] Usando: $COMPOSE"

echo "[+] Entrando al repositorio..."
cd /home/daniel/Marketplace-UCN

echo "[+] Actualizando repo..."
git pull origin main

echo "[+] Deteniendo containers..."
$COMPOSE down

echo "[+] Levantando servicios..."
$COMPOSE up -d --build

echo "[+] Limpiando imágenes antiguas..."
$RUNTIME image prune -f

echo "[+] Deploy completado"