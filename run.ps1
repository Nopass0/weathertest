# Проверка наличия Bun
if (!(Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "Bun не установлен. Установка Bun..."
    iex "& {$(irm bun.sh)} bun"
    $env:Path += ";$env:LOCALAPPDATA\bun"
}

# Установка зависимостей для start.ts
Write-Host "Установка зависимостей для start.ts..."
bun install

# Запуск скрипта start.ts
Write-Host "Запуск приложения..."
bun run start.ts

Read-Host -Prompt "Нажмите Enter для выхода"