@echo off
echo Clearing Vite cache...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Cache cleared!
) else (
    echo No cache found.
)
echo.
echo Please restart your dev server with: npm run dev
