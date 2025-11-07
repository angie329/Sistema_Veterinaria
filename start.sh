#!/bin/bash

echo "Iniciando servidor de desarrollo del frontend..."
cd frontend/
# El '&' envía el proceso a segundo plano, permitiendo que el script continúe
npm run dev &
cd ..

echo "Iniciando servidor de desarrollo del backend..."
cd backend/
# Hacemos lo mismo con el backend
npm run dev &
cd ..

echo "Servidores de frontend y backend iniciados."
echo "Presiona Ctrl+C para detenerlos (puede que necesites hacerlo varias veces) o cierra la terminal."
# 'wait' espera a que todos los trabajos en segundo plano terminen antes de que el script salga.
wait
