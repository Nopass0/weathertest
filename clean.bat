@echo off
chcp 65001 > nul

echo Очистка зависимостей проекта...

REM Очистка зависимостей
if exist node_modules (
    echo Удаление node_modules...
    rmdir /s /q node_modules
)

REM Удаление файла блокировки клиента
if exist client\bun.lockb (
    echo Удаление bun.lockb...
    del client\bun.lockb
)

REM Очистка зависимостей клиента
if exist client\node_modules (
    echo Удаление node_modules клиента...
    rmdir /s /q client\node_modules
)

REM Очистка зависимостей сервера
if exist server\node_modules (
    echo Удаление node_modules сервера...
    rmdir /s /q server\node_modules
)

REM Удаление файла блокировки клиента
if exist client\bun.lockb (
    echo Удаление bun.lockb клиента...
    del client\bun.lockb
)

REM Удаление файла блокировки сервера
if exist server\bun.lockb (
    echo Удаление bun.lockb сервера...
    del server\bun.lockb
)

echo Очистка завершена.