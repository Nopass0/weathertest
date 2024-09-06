#!/bin/bash

echo "Очистка зависимостей проекта..."

# Очистка зависимостей 
if [ -d "node_modules" ]; then
    echo "Удаление node_modules..."
    rm -rf node_modules
fi

# Удаление файла блокировки клиента
if [ -f "bun.lockb" ]; then
    echo "Удаление bun.lockb..."
    rm bun.lockb
fi

# Очистка зависимостей клиента
if [ -d "client/node_modules" ]; then
    echo "Удаление node_modules клиента..."
    rm -rf client/node_modules
fi

# Очистка зависимостей сервера
if [ -d "server/node_modules" ]; then
    echo "Удаление node_modules сервера..."
    rm -rf server/node_modules
fi

# Удаление файла блокировки клиента
if [ -f "client/bun.lockb" ]; then
    echo "Удаление bun.lockb клиента..."
    rm client/bun.lockb
fi

# Удаление файла блокировки сервера
if [ -f "server/bun.lockb" ]; then
    echo "Удаление bun.lockb сервера..."
    rm server/bun.lockb
fi

echo "Очистка завершена."