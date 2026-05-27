@echo off
chcp 65001 > nul
title DJADWEB-IA — Servidor Backend

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║        DJADWEB-IA  ·  Backend API        ║
echo  ║          Mock Server  ·  Puerto 3000      ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python no encontrado. Instálalo desde https://python.org
    pause
    exit /b 1
)

:: Ir al directorio del script
cd /d "%~dp0"

:: Crear entorno virtual si no existe
if not exist "venv\" (
    echo  [1/3] Creando entorno virtual...
    python -m venv venv
)

:: Activar entorno virtual
echo  [2/3] Activando entorno virtual...
call venv\Scripts\activate.bat

:: Instalar dependencias
echo  [3/3] Instalando dependencias...
pip install -r requirements.txt -q

echo.
echo  ✓ Backend listo. Iniciando en http://localhost:3000
echo  ✓ Documentación API: http://localhost:3000/docs
echo  ✓ Presiona Ctrl+C para detener el servidor
echo.

:: Iniciar el servidor
python main.py

pause
