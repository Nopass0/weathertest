# Используем образ Bun
FROM oven/bun:1 as base
WORKDIR /app

# Устанавливаем зависимости
COPY package.json bun.lockb ./
RUN bun install

# Копируем исходный код и Prisma схему
COPY . .
COPY prisma ./prisma/

# Заменяем bcrypt на argon2
RUN bun remove bcrypt
RUN bun add argon2

# Генерируем Prisma клиент
RUN bunx prisma generate

# Копируем скрипт инициализации и делаем его исполняемым
COPY init-script.ts ./
RUN chmod +x init-script.ts

# Запускаем скрипт инициализации и затем приложение
CMD ["bun", "run", "init-script.ts", "&&", "bun", "run", "start"]