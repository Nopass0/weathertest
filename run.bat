@echo off
setlocal enabledelayedexpansion

REM Установка кодировки UTF-8
chcp 65001 > nul

REM Проверка наличия Bun
where bun >nul 2>nul
if %errorlevel% neq 0 (
    echo Bun не установлен. Установка Bun...
    powershell -Command "iwr bun.sh/install.ps1|iex"
    if !errorlevel! neq 0 (
        echo Не удалось установить Bun. Пожалуйста, установите его вручную с https://bun.sh
        pause
        exit /b 1
    )
    REM Добавление Bun в PATH для текущей сессии
    set "PATH=%LOCALAPPDATA%\bun;%PATH%"
)

REM Установка зависимостей для start.ts
echo Установка зависимостей для start.ts...
call bun install
if %errorlevel% neq 0 (
    echo Не удалось установить зависимости. Проверьте подключение к интернету и права доступа.
    pause
    exit /b 1
)

REM Запуск скрипта start.ts
echo Запуск приложения...
call bun run start.ts
if %errorlevel% neq 0 (
    echo Произошла ошибка при запуске приложения.
    pause
    exit /b 1
)

pause