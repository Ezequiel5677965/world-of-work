@echo off
title Maquinita - Movimiento de Suelo
cd /d "%~dp0"
echo =========================================================
echo   Maquinita - Sistema de Presupuestos de Suelo
echo =========================================================
echo.
echo Iniciando el servidor y abriendo la aplicacion...
echo.
start http://localhost:5173
npm run dev
pause
