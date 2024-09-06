#!/bin/bash

# Проверка наличия Bun
if ! command -v bun &> /dev/null
then
    echo "Bun не установлен. Установка Bun..."
    curl -fsSL https://bun.sh/install | bash
    # Добавление Bun в PATH для текущей сессии
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Установка зависимостей для start.ts
echo "Установка зависимостей для start.ts..."
bun install

# Запуск скрипта start.ts
echo "Запуск приложения..."
bun run start.ts

read -p "Нажмите Enter для выхода"