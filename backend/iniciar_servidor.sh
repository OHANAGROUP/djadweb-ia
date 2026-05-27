#!/bin/bash

echo ""
echo " ╔══════════════════════════════════════════╗"
echo " ║        DJADWEB-IA  ·  Backend API        ║"
echo " ║          Mock Server  ·  Puerto 3000      ║"
echo " ╚══════════════════════════════════════════╝"
echo ""

# Ir al directorio del script
cd "$(dirname "$0")"

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo " [ERROR] Python3 no encontrado. Instálalo primero."
    exit 1
fi

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo " [1/3] Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo " [2/3] Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo " [3/3] Instalando dependencias..."
pip install -r requirements.txt -q

echo ""
echo " ✓ Backend listo. Iniciando en http://localhost:3000"
echo " ✓ Documentación API: http://localhost:3000/docs"
echo " ✓ Presiona Ctrl+C para detener"
echo ""

python main.py
