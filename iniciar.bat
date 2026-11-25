@echo off
title World of Work - Presupuestos de Suelo
cd /d "%~dp0"
echo =========================================================
echo   World of Work - Presupuestos de Suelo
echo =========================================================
echo.
echo Iniciando el servidor...
echo.
echo * En tu computadora: http://localhost:5173
echo * En tu celular (mismo Wi-Fi): http://192.168.1.39:5173
echo.
start http://localhost:5173
npm run dev
pause
